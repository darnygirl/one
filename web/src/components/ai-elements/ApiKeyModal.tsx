/**
 * API Key Modal Component
 *
 * Beautiful modal for managing OpenRouter API key
 * with security warnings and validation
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { $isApiKeyModalOpen, $apiKey, setApiKey, clearApiKey } from '@/stores/chatStore';
import { trackEvent, ChatEvents } from '@/lib/ai/analytics';

export function ApiKeyModal() {
  const isOpen = useStore($isApiKeyModalOpen);
  const currentApiKey = useStore($apiKey);

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen && currentApiKey) {
      setInputKey(currentApiKey);
    }
  }, [isOpen, currentApiKey]);

  const validateApiKey = (key: string): boolean => {
    // Basic validation for OpenRouter API keys
    if (!key.trim()) {
      setError('API key is required');
      return false;
    }

    if (!key.startsWith('sk-or-v1-')) {
      setError('Invalid API key format. OpenRouter keys start with "sk-or-v1-"');
      return false;
    }

    if (key.length < 40) {
      setError('API key appears to be too short');
      return false;
    }

    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateApiKey(inputKey)) return;

    setIsValidating(true);

    try {
      // Test the API key with a minimal request
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${inputKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key. Please check and try again.');
      }

      // Save the key
      setApiKey(inputKey);
      trackEvent(ChatEvents.API_KEY_ADDED);

      // Close modal
      $isApiKeyModalOpen.set(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    trackEvent(ChatEvents.API_KEY_REMOVED);
    $isApiKeyModalOpen.set(false);
  };

  const handleClose = () => {
    $isApiKeyModalOpen.set(false);
    setError('');
    setInputKey('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            {currentApiKey ? 'Manage API Key' : 'Add OpenRouter API Key'}
          </DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to access all AI models
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Security Notice */}
          <Alert>
            <span className="text-xl">🔒</span>
            <AlertDescription className="ml-2">
              <strong>Security Notice:</strong> Your API key is stored locally in your browser
              and never sent to our servers. Only use this on trusted devices.
            </AlertDescription>
          </Alert>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-base font-semibold">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                placeholder="sk-or-v1-..."
                className="pr-20 font-mono text-sm"
                autoComplete="off"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Get API Key Link */}
          <Card className="glass-card border-primary/20">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span>🎯</span>
                  Don't have an API key?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get your free OpenRouter API key to access all models:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>✓ Free credits for testing</li>
                  <li>✓ Access to 100+ AI models</li>
                  <li>✓ Pay only for what you use</li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                >
                  Get API Key from OpenRouter →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Free Tier Notice */}
          <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/30">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span>💡</span>
                  Free Tier Available
                </h4>
                <p className="text-sm text-muted-foreground">
                  You can use <strong>Gemini 2.5 Flash Lite</strong> without an API key!
                  Click "Skip for now" to try it out.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentApiKey ? (
            <>
              <Button
                variant="destructive"
                onClick={handleClear}
                className="w-full sm:w-auto"
              >
                Remove Key
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isValidating || !inputKey || inputKey === currentApiKey}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isValidating ? 'Validating...' : 'Update Key'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSave}
                disabled={isValidating || !inputKey}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isValidating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Validating...
                  </>
                ) : (
                  'Save & Continue'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
