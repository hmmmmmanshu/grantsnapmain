import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface UserDocument {
  id: string;
  user_id: string;
  document_name: string;
  storage_path: string;
  uploaded_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) return { error: 'User not authenticated' };
    setLoading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;
      const { data, error: insertError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_name: file.name,
          storage_path,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setDocuments(prev => [data, ...prev]);
      return { data, url: publicUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string, storagePath: string) => {
    if (!user) return { error: 'User not authenticated' };
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      await supabase.storage.from('documents').remove([storagePath]);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
} 