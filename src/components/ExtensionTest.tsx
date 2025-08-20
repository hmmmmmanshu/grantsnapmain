import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  sendCommandToExtension, 
  isExtensionAvailable, 
  handleExtensionError, 
  promptExtensionInstallation 
} from '@/lib/extensionService';
import { Globe, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

const ExtensionTest = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(null);

  const testExtensionAvailability = async () => {
    setStatus('testing');
    setMessage('Checking extension availability...');
    
    try {
      const available = await isExtensionAvailable();
      setExtensionAvailable(available);
      setStatus('success');
      setMessage(available ? 'Extension is available and responding!' : 'Extension is not available');
    } catch (error) {
      setStatus('error');
      setMessage(`Error checking extension: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setExtensionAvailable(false);
    }
  };

  const testSendMessage = async () => {
    setStatus('testing');
    setMessage('Sending test message to extension...');
    
    try {
      const response = await sendCommandToExtension({
        action: 'test_message',
        data: {
          message: 'Hello from dashboard!',
          timestamp: new Date().toISOString()
        }
      });
      
      setStatus('success');
      setMessage(`Message sent successfully! Response: ${JSON.stringify(response)}`);
    } catch (error) {
      handleExtensionError(
        error,
        // Extension missing callback
        () => {
          setStatus('error');
          setMessage('Extension not installed. Please install it to test communication.');
          promptExtensionInstallation();
        },
        // Other error callback
        (error) => {
          setStatus('error');
          setMessage(`Communication error: ${error.message}`);
        }
      );
    }
  };

  const testOpenUrl = async () => {
    setStatus('testing');
    setMessage('Testing URL opening functionality...');
    
    try {
      await sendCommandToExtension({
        action: 'open_url',
        url: 'https://example.com/test-grant',
        title: 'Test Grant Opportunity',
        type: 'test'
      });
      
      setStatus('success');
      setMessage('URL open command sent successfully! Check if a new tab opened.');
    } catch (error) {
      handleExtensionError(
        error,
        // Extension missing callback
        () => {
          setStatus('error');
          setMessage('Extension not installed. Please install it to test URL opening.');
          promptExtensionInstallation();
        },
        // Other error callback
        (error) => {
          setStatus('error');
          setMessage(`Communication error: ${error.message}`);
        }
      );
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <TestTube className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'testing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Extension Communication Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <div className={`font-medium ${getStatusColor()}`}>
              {status === 'idle' && 'Ready to test'}
              {status === 'testing' && 'Testing...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error occurred'}
            </div>
            {message && (
              <div className="text-sm text-gray-600 mt-1">{message}</div>
            )}
          </div>
        </div>

        {/* Extension Status */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Extension Status:</span>
          {extensionAvailable === null ? (
            <span className="text-sm text-gray-500">Unknown</span>
          ) : extensionAvailable ? (
            <span className="text-sm text-green-600 font-medium">Available</span>
          ) : (
            <span className="text-sm text-red-600 font-medium">Not Available</span>
          )}
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={testExtensionAvailability}
            variant="outline"
            disabled={status === 'testing'}
          >
            Test Availability
          </Button>
          
          <Button
            onClick={testSendMessage}
            variant="outline"
            disabled={status === 'testing' || extensionAvailable === false}
          >
            Send Test Message
          </Button>
          
          <Button
            onClick={testOpenUrl}
            variant="outline"
            disabled={status === 'testing' || extensionAvailable === false}
          >
            Test URL Opening
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <strong>Test Availability:</strong> Checks if the extension is installed and responding</p>
          <p>• <strong>Send Test Message:</strong> Sends a simple message to test communication</p>
          <p>• <strong>Test URL Opening:</strong> Tests the extension's ability to open URLs in new tabs</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtensionTest;
