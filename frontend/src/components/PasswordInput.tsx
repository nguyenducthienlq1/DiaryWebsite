import { useState } from 'react';

interface PasswordInputProps {
  disabled: boolean;
  id: string;
  name: string;
  required?: boolean;
  placeholder: string;
}

export default function PasswordInput({
  disabled,
  id,
  name,
  required = true,
  placeholder
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        autoComplete="current-password"
        className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 pr-20 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 disabled:bg-stone-100"
        disabled={disabled}
        id={id}
        name={name}
        required={required}
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
      />
      <button
        aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-3 text-sm font-medium text-stone-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:opacity-60"
        disabled={disabled}
        onClick={() => setIsVisible((visible) => !visible)}
        type="button"
      >
        {isVisible ? 'Ẩn' : 'Hiện'}
      </button>
    </div>
  );
}
