import React, { useState } from 'react';
import { Button } from './ui/Button';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    await onSave(password);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Cambiar Contraseña</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg border border-red-100 text-center">
              {error}
            </p>
          )}

          <div className="pt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};