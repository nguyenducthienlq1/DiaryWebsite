import { type FormEvent, useState } from 'react';
import PasswordInput from '../components/PasswordInput';
import { useRegister } from '../hooks/useRegister';

export default function RegisterPage() {
    const register = useRegister();
    const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

    const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email');
        const displayName = formData.get('displayName');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (
            typeof email !== 'string' ||
            typeof displayName !== 'string' ||
            typeof password !== 'string' ||
            typeof confirmPassword !== 'string'
        ) {
            return;
        }
        if (password !== confirmPassword) {
            setLocalErrorMessage('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLocalErrorMessage(null);
        register.sendOtp({ email, displayName, password, confirmPassword });
    };

    const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const otp = formData.get('otp');

        if (typeof otp !== 'string') {
            return;
        }
        register.submitOtp(otp);
    };
    if (register.currentStep === 'details') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
                <div className="w-full max-w-sm bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow">
                    <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">Register</h1>
                    {(localErrorMessage ?? register.errorMessage) && (
                        <div role="alert" className="mb-4 text-sm text-red-600">
                            {localErrorMessage ?? register.errorMessage}
                        </div>
                    )}
                    <form
                        className="space-y-4 sm:space-y-5"
                        onSubmit={handleDetailsSubmit}
                    >
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-800">
                                Email
                            </label>
                            <input
                                autoComplete="email"
                                autoFocus
                                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:bg-stone-100"
                                id="email"
                                name="email"
                                placeholder="ban@example.com"
                                required
                                type="email"
                            />
                        </div>
                        <div>
                            <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-stone-800">
                                Tên hiển thị
                            </label>
                            <input
                                autoComplete="name"
                                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:bg-stone-100"
                                id="displayName"
                                name="displayName"
                                placeholder="Nhập tên hiển thị"
                                required
                                type="text"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-800">
                                Mật khẩu
                            </label>
                            <PasswordInput
                                disabled={register.isSendingOtp}
                                id="password"
                                name="password"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-stone-800">
                                Nhập lại Mật khẩu
                            </label>
                            <PasswordInput
                                disabled={register.isSendingOtp}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={register.isSendingOtp}
                        >
                            {register.isSendingOtp ? 'Creating Account...' : 'Continue'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        );
    } else if (register.currentStep === 'otp') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
                <div className="w-full max-w-sm bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow">
                    <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">Enter OTP</h1>
                    {register.errorMessage && (
                        <div role="alert" className="mb-4 text-sm text-red-600">
                            {register.errorMessage}
                        </div>
                    )}
                    <form className="space-y-4 sm:space-y-5" onSubmit={handleOtpSubmit}>
                        <div>
                            <label htmlFor="otp" className="mb-2 block text-sm font-medium text-stone-800">
                                OTP
                            </label>
                            <input
                                key="otp-input"
                                autoComplete="off"
                                defaultValue=""
                                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:bg-stone-100"
                                id="otp"
                                name="otp"
                                placeholder="Enter OTP"
                                required
                                type="text"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={register.isRegistering}
                        >
                            {register.isRegistering ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        OTP has been sent to <strong>{register.details?.email}</strong>.
                    </p>
                    <div className="mt-4 flex justify-between">
                        <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                            onClick={register.goBack}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                            onClick={register.resendOtp}
                            disabled={register.isSendingOtp}
                        >
                            {register.isSendingOtp ? 'Resending...' : 'Resend OTP'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
