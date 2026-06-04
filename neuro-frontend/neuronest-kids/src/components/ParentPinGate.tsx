import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParentPinGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

// Simple in-memory PIN storage (in production, use secure storage)
const PIN_STORAGE_KEY = 'neuronest_parent_pin';

export function ParentPinGate({ 
  open, 
  onOpenChange, 
  onSuccess,
  title = "Parent Access",
  description = "Enter your PIN to continue"
}: ParentPinGateProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    setHasExistingPin(!!savedPin);
    setIsSettingPin(!savedPin);
  }, [open]);

  useEffect(() => {
    if (open) {
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setError('');
      // Focus first input after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    const currentPin = isConfirm ? confirmPin : pin;
    
    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const verifyPin = () => {
    const enteredPin = pin.join('');
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (enteredPin === savedPin) {
      toast({
        title: 'Access Granted! ✅',
        description: 'Welcome, parent!',
      });
      onSuccess();
      onOpenChange(false);
    } else {
      setError('Wrong PIN. Try again!');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const saveNewPin = () => {
    const newPin = pin.join('');
    const confirmPinStr = confirmPin.join('');
    
    if (newPin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }
    
    if (newPin !== confirmPinStr) {
      setError('PINs do not match. Try again!');
      setConfirmPin(['', '', '', '']);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    toast({
      title: 'PIN Created! 🔐',
      description: 'Your parent PIN has been set.',
    });
    onSuccess();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (isSettingPin) {
      saveNewPin();
    } else {
      verifyPin();
    }
  };

  const resetPin = () => {
    setIsSettingPin(true);
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
    setError('');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const renderPinInputs = (values: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>, isConfirm = false) => (
    <div className="flex justify-center gap-3">
      {values.map((digit, index) => (
        <Input
          key={index}
          ref={el => refs.current[index] = el}
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className={cn(
            'w-14 h-14 text-center text-2xl font-bold rounded-xl',
            'border-2 focus:border-primary focus:ring-2 focus:ring-primary/20',
            error && 'border-destructive shake'
          )}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {isSettingPin 
              ? "Create a 4-digit PIN to protect parent features"
              : description
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enter PIN */}
          <div className="space-y-3">
            <Label className="text-center block font-medium">
              {isSettingPin ? 'Create your PIN' : 'Enter your PIN'}
            </Label>
            {renderPinInputs(pin, inputRefs)}
          </div>

          {/* Confirm PIN (only when setting) */}
          {isSettingPin && pin.every(d => d !== '') && (
            <div className="space-y-3 animate-fade-in">
              <Label className="text-center block font-medium">
                Confirm your PIN
              </Label>
              {renderPinInputs(confirmPin, confirmInputRefs, true)}
            </div>
          )}

          {/* Show/Hide toggle */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPin(!showPin)}
              className="text-muted-foreground"
            >
              {showPin ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide PIN
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show PIN
                </>
              )}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-center text-destructive font-medium animate-fade-in flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </p>
          )}

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            className="w-full rounded-xl h-12 text-lg font-bold btn-3d"
            disabled={isSettingPin ? !pin.every(d => d) || !confirmPin.every(d => d) : !pin.every(d => d)}
          >
            {isSettingPin ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Set PIN
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Unlock
              </>
            )}
          </Button>

          {/* Forgot PIN */}
          {hasExistingPin && !isSettingPin && (
            <Button
              variant="link"
              onClick={resetPin}
              className="w-full text-muted-foreground"
            >
              Forgot PIN? Create a new one
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
