import React, { useState } from 'react';
import { User, UserRole } from '../types';
// FIX: Aliased the imported `login` function to `apiLogin` to avoid any potential naming conflicts with the `Login` component.
import { login as apiLogin } from '../services/apiService';
import Icon from './common/Icon';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  isSsoEnabled: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isSsoEnabled }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await apiLogin({ username, password });
      onLoginSuccess(user);
    } catch (err: any) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setError('Não foi possível conectar ao servidor. Verifique se a API está em execução.');
        } else {
            setError(err.message || 'Usuário ou senha inválidos');
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSsoLogin = () => {
    // Redirect to the backend SSO login endpoint
    window.location.href = `http://${window.location.hostname}:3001/api/sso/login`;
  };

const developerPhoto = `data:image/png;base64,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-`

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4">
      <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-8">
            <Icon name="ShieldCheck" size={48} className="mx-auto text-brand-primary mb-2" />
          <h1 className="text-3xl font-bold text-brand-dark dark:text-dark-text-primary">Inventário Pro</h1>
          <p className="text-gray-500 dark:text-dark-text-secondary mt-1">Faça login para continuar</p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              data-testid="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border dark:border-dark-border rounded w-full py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-dark-text-primary leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex: admin"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-dark-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border dark:border-dark-border rounded w-full py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-dark-text-primary mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
            />
          </div>
          <div className="flex flex-col items-center justify-between gap-4">
            <button
              type="submit"
              data-testid="login-button"
              disabled={isLoading}
              className="bg-brand-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            {isSsoEnabled && (
                <>
                    <div className="relative w-full my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-dark-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-dark-text-secondary">ou</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSsoLogin}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-dark-text-primary font-semibold py-2 px-4 border border-gray-300 dark:border-dark-border rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full flex items-center justify-center gap-2"
                    >
                        <Icon name="KeyRound" size={18}/> Entrar com SSO
                    </button>
                </>
            )}
          </div>
        </form>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 text-xs">
        <img
          src={developerPhoto}
          alt="Foto do Desenvolvedor"
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-dark-border"
        />
        <div className="text-left text-gray-500 dark:text-dark-text-secondary">
          <p className="font-semibold">MRR INFORMATICA</p>
          <p className="text-gray-400 dark:text-gray-500">&copy; 2025 Dev: Marcelo Reis</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
