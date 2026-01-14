import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-medium transition-all active:scale-95 text-sm md:text-base flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30",
    outline: "border-2 border-gray-300 text-gray-600 hover:border-gray-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed active:scale-100' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <i className="fas fa-circle-notch fa-spin"></i>}
      {children}
    </button>
  );
};