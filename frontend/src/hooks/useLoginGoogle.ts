import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import * as authService from '../services/authService';

export function useLoginGoogle() {
    const [buttonContainer, setButtonContainer] =
        useState<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const containerRef = useCallback((element: HTMLDivElement | null) => {
        setButtonContainer(element);
    }, []);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

        if (!clientId) {
            setErrorMessage('Chưa cấu hình Google Client ID ở frontend.');
            return;
        }
        if (!buttonContainer) return;
        const container = buttonContainer;

        let cancelled = false;
        let intervalId: number | undefined;
        const timeoutId = window.setTimeout(() => {
            if (!cancelled && !window.google) {
                setErrorMessage(
                    'Không thể tải Google Sign-In. Kiểm tra kết nối mạng hoặc trình chặn quảng cáo.',
                );
            }
        }, 10000);

        function renderButton() {
            if (cancelled || !window.google) return false;

            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }

            container.replaceChildren();
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    setIsPending(true);
                    setErrorMessage(null);

                    try {
                        const session = await authService.googleLogin(response.credential);
                        login(session.user, session.accessToken);
                        navigate('/entry', { replace: true });
                    } catch (error) {
                        setErrorMessage(
                            error instanceof Error
                                ? error.message
                                : 'Không thể đăng nhập Google.',
                        );
                    } finally {
                        setIsPending(false);
                    }
                },
            });

            window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                shape: 'rectangular',
                text: 'signin_with',
                width: Math.min(
                    400,
                    Math.max(200, Math.round(container.clientWidth)),
                ),
            });
            return true;
        }

        if (!renderButton()) {
            intervalId = window.setInterval(renderButton, 100);
        }

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
        };
    }, [buttonContainer, login, navigate]);

    return {
        containerRef,
        isPending,
        errorMessage,
    };
}