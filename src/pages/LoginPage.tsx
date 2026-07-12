import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';
import { passwordRequirementChecks, strongPasswordSchema } from '../utils/password';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
  rememberMe: z.boolean().default(true),
});

const registerSchema = z
  .object({
    name: z.string().min(3, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    rememberMe: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const { user, login, register: registerUser } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  });

  const {
    register: registerSignupField,
    watch,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { rememberMe: true },
  });

  const registerPassword = watch('password') ?? '';
  const passwordChecks = useMemo(
    () => passwordRequirementChecks(registerPassword),
    [registerPassword],
  );

  if (user) return <Navigate to="/dashboard" replace />;

  const switchMode = (mode: AuthMode) => {
    setAuthError('');
    setAuthMode(mode);
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsSubmittingLogin(true);
    setAuthError('');

    try {
      await login(data.email, data.password, data.rememberMe);
    } catch (error) {
      setAuthError(
        getApiErrorMessage(error, {
          fallback: 'Não foi possível fazer login agora. Tente novamente.',
          forbiddenMessage: 'Seu acesso está bloqueado no momento. Procure um administrador.',
          validationMessage: 'Verifique e-mail e senha e tente novamente.',
        }),
      );
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsSubmittingRegister(true);
    setAuthError('');

    try {
      await registerUser(data.name, data.email, data.password, data.rememberMe);
    } catch (error) {
      setAuthError(
        getApiErrorMessage(error, {
          fallback: 'Não foi possível concluir o cadastro agora. Tente novamente.',
          conflictMessage: 'Já existe um cadastro com esse e-mail.',
          validationMessage: 'Revise os dados informados e tente novamente.',
        }),
      );
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const inputClass =
    'w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-all placeholder-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#6c63ff" strokeWidth="2.5" />
                <circle cx="10" cy="10" r="3" fill="#6c63ff" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">HelpDesk</span>
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                authMode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                authMode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fazer cadastro
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-base font-semibold text-gray-900">
              {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie seu acesso'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {authMode === 'login'
                ? 'Faça login para acessar o sistema'
                : 'Cadastre-se com uma senha forte para começar'}
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg mb-5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {authError}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">E-mail</label>
                <input
                  {...registerLoginField('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={`${inputClass} ${
                    loginErrors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                  }`}
                />
                {loginErrors.email && <p className="text-xs text-red-500 mt-1">{loginErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    {...registerLoginField('password')}
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`${inputClass} pr-10 ${
                      loginErrors.password
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{loginErrors.password.message}</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                <input
                  {...registerLoginField('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#6c63ff]/30"
                />
                Lembrar meu acesso neste dispositivo
              </label>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmittingLogin ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nome completo</label>
                <input
                  {...registerSignupField('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Ex: João Silva"
                  className={`${inputClass} ${
                    registerErrors.name
                      ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                  }`}
                />
                {registerErrors.name && <p className="text-xs text-red-500 mt-1">{registerErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">E-mail</label>
                <input
                  {...registerSignupField('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className={`${inputClass} ${
                    registerErrors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                  }`}
                />
                {registerErrors.email && <p className="text-xs text-red-500 mt-1">{registerErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    {...registerSignupField('password')}
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Ex: HelpDesk@2026"
                    className={`${inputClass} pr-10 ${
                      registerErrors.password
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{registerErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <input
                    {...registerSignupField('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className={`${inputClass} pr-10 ${
                      registerErrors.confirmPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{registerErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Sua senha deve conter:</p>
                <div className="space-y-1.5">
                  {passwordChecks.map((requirement) => (
                    <div key={requirement.label} className="flex items-center gap-2 text-xs text-gray-600">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                          requirement.met ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <Check size={11} />
                      </span>
                      <span>{requirement.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                <input
                  {...registerSignupField('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#6c63ff]/30"
                />
                Manter meu acesso após o cadastro
              </label>

              <button
                type="submit"
                disabled={isSubmittingRegister}
                className="w-full bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmittingRegister ? 'Criando cadastro...' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ServiceDesk Sociedade Hípica Paulista © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
