import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface UserDocument {
  id: string;
  user_id: string;
  document_name: string;
  storage_path: string;
  document_type?: string;
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

  const uploadDocument = async (file: File, documentType?: string) => {
    if (!user) return { error: 'User not authenticated' };
    setLoading(true);
    setError(null);
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed. Please upload PDF, Word, text, or image files.');
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Please upload files smaller than 50MB.');
      }

      const fileExt = file.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Insert document record into database
      const { data, error: insertError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_name: file.name,
          storage_path: storagePath,
          document_type: documentType,
        })
        .select()
        .single();
      
      if (insertError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from('documents').remove([storagePath]);
        throw insertError;
      }

      setDocuments(prev => [data, ...prev]);
      return { data, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  };

  const deleteDocument = async (id: string, storagePath: string) => {
    if (!user) return { error: 'User not authenticated' };
    setLoading(true);
    setError(null);
    try {
      // Delete from database first
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Then delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Don't throw here as the database record is already deleted
      }
      
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
    getDocumentUrl,
    refetch: fetchDocuments,
  };
} 