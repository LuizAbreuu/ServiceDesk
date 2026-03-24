import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { user, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Se já estiver logado, redireciona direto
  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAuthError('');
    try {
      await login(data.email, data.password);
      // O AuthContext redireciona automaticamente após o login
    } catch {
      setAuthError('Credenciais inválidas. Verifique e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#6c63ff" strokeWidth="2.5"/>
                <circle cx="10" cy="10" r="3"  fill="#6c63ff"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">HelpDesk</span>
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h1 className="text-base font-semibold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500 mt-1">Faça login para acessar o sistema</p>
          </div>

          {/* Erro de autenticação */}
          {authError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg mb-5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {authError}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* E-mail */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                E-mail
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-all
                  placeholder-gray-300
                  ${errors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-all
                    placeholder-gray-300
                    ${errors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                    }`}
                />
                {/* Botão mostrar/ocultar senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff size={15} />
                    : <Eye    size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white text-sm font-medium
                py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="15" height="15" viewBox="0 0 15 15" fill="none"
                  >
                    <circle
                      cx="7.5" cy="7.5" r="6"
                      stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"
                    />
                    <path
                      d="M7.5 1.5a6 6 0 016 6"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    />
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Hint de credenciais demo */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-1">Credenciais para teste:</p>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">admin@helpdesk.com</span>
              {' '}·{' '}
              <span className="font-medium text-gray-700">Admin@123456</span>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ServiceDesk © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}