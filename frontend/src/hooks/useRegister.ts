import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../types/auth';
import * as authService from '../services/authService';

type RegisterDetails = Omit<RegisterRequest, 'otp'>;
type RegisterStep = 'details' | 'otp';

export function useRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegisterStep>('details');
  const [details, setDetails] = useState<RegisterDetails | null>(null);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  const otpMutation = useMutation({
    mutationFn: (email: string) => authService.sendOtp(email),
    onSuccess: () => setCurrentStep('otp'),
  });

  const registerMutation = useMutation({
    mutationFn: (request: RegisterRequest) =>
      authService.register(request),
    onSuccess: () => navigate('/login', { replace: true }),
  });

  function sendOtp(registerDetails: RegisterDetails): void {
    if (otpMutation.isPending || registerMutation.isPending) {
      return;
    }

    const normalizedDetails: RegisterDetails = {
      ...registerDetails,
      email: registerDetails.email.trim(),
      displayName: registerDetails.displayName.trim(),
    };

    setDetails(normalizedDetails);
    setLocalErrorMessage(null);
    registerMutation.reset();
    otpMutation.mutate(normalizedDetails.email);
  }

  function resendOtp(): void {
    if (!details || otpMutation.isPending || registerMutation.isPending) {
      return;
    }

    setLocalErrorMessage(null);
    registerMutation.reset();
    otpMutation.mutate(details.email);
  }

  function submitOtp(otp: string): void {
    if (!details) {
      setLocalErrorMessage('Vui lòng nhập lại thông tin đăng ký.');
      setCurrentStep('details');
      return;
    }
    if (registerMutation.isPending) {
      return;
    }

    const normalizedOtp = otp.trim();
    if (!normalizedOtp) {
      setLocalErrorMessage('Vui lòng nhập mã OTP.');
      return;
    }

    setLocalErrorMessage(null);
    registerMutation.mutate({
      ...details,
      otp: normalizedOtp,
    });
  }

  function goBack(): void {
    otpMutation.reset();
    registerMutation.reset();
    setLocalErrorMessage(null);
    setCurrentStep('details');
  }

  const mutationError =
    currentStep === 'otp'
      ? registerMutation.error ?? otpMutation.error
      : otpMutation.error;

  return {
    currentStep,
    details,
    sendOtp,
    resendOtp,
    submitOtp,
    goBack,
    isSendingOtp: otpMutation.isPending,
    isRegistering: registerMutation.isPending,
    errorMessage: localErrorMessage ?? mutationError?.message ?? null,
  };
}