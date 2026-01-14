import React, { useEffect, useState } from 'react';
import { StorageService } from './services/storage';
import { User, UserRole, AppConfig } from './types';
import { Button } from './components/ui/Button';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // App Config State
  const [appConfig, setAppConfig] = useState<AppConfig>({ appName: 'Parish Booker', appLogo: 'fa-church' });
  
  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadConfig = async () => {
    const config = await StorageService.getAppConfig();
    setAppConfig(config);
  };

  useEffect(() => {
    const init = async () => {
      await loadConfig();
      const storedUser = StorageService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError('');

    const foundUser = await StorageService.login(username, password);
    if (foundUser) {
      setUser(foundUser);
    } else {
      setAuthError('Credenciales incorrectas.');
    }
    setIsProcessing(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setAuthError('');

    if (!name || !username || !password) {
      setAuthError('Todos los campos son obligatorios.');
      setIsProcessing(false);
      return;
    }

    const result = await StorageService.register(name, username, password);
    
    if (typeof result === 'string') {
      // It's an error message
      setAuthError(result);
    } else {
      // It's a user object
      setUser(result);
    }
    setIsProcessing(false);
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setAuthError('');
  };

  const handleChangePassword = async (newPassword: string) => {
    if (user) {
      await StorageService.updatePassword(user.id, newPassword);
      setShowPasswordModal(false);
      alert('Contraseña actualizada correctamente.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setAuthError('');
    setUsername('');
    setPassword('');
    setName('');
  };

  // Render helper for Logo
  const renderLogo = () => {
    if (appConfig.appLogo.startsWith('http')) {
      return <img src={appConfig.appLogo} alt="Logo" className="w-full h-full object-cover" />;
    }
    return <i className={`fas ${appConfig.appLogo} text-white text-sm`}></i>;
  };

  const renderBigLogo = () => {
    if (appConfig.appLogo.startsWith('http')) {
       return <img src={appConfig.appLogo} alt="Logo" className="w-full h-full object-cover" />;
    }
    return <i className={`fas ${appConfig.appLogo} text-3xl text-white`}></i>;
  }

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center text-blue-600"><i className="fas fa-circle-notch fa-spin text-4xl"></i></div>;
  }

  // LOGIN / REGISTER SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 overflow-hidden">
              {renderBigLogo()}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{appConfig.appName}</h1>
            <p className="text-gray-500 text-sm mt-2">
              {isRegistering ? 'Crear nueva cuenta' : 'Sistema de Reserva de Salones'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            
            {isRegistering && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1 ml-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegistering}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1 ml-1">Usuario</label>
              <input
                type="text"
                placeholder={isRegistering ? "Elige un usuario" : "Ej: admin o user"}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1 ml-1">Contraseña</label>
              <input
                type="password"
                placeholder="********"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">{authError}</p>
            )}

            <Button fullWidth type="submit" isLoading={isProcessing} className="mt-2">
              {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 mb-2">
              {isRegistering ? '¿Ya tienes cuenta?' : '¿Eres nuevo aquí?'}
            </p>
            <button 
              onClick={toggleMode}
              className="text-blue-600 font-bold hover:underline text-sm"
              type="button"
            >
              {isRegistering ? 'Inicia Sesión' : 'Crear Cuenta'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP LAYOUT
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 mb-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                {renderLogo()}
             </div>
             <div>
               <h1 className="font-bold text-gray-800 leading-none">{appConfig.appName}</h1>
               <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.role === UserRole.ADMIN ? 'Administrador' : 'Miembro'}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:block text-sm text-gray-600">Hola, <b>{user.name}</b></span>
            
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Cambiar Contraseña"
            >
              <i className="fas fa-key"></i>
            </button>

            <button 
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Cerrar Sesión"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-4">
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard onConfigUpdate={loadConfig} />
        ) : (
          <UserDashboard currentUser={user} />
        )}
      </main>

      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)}
          onSave={handleChangePassword}
        />
      )}
    </div>
  );
}

export default App;