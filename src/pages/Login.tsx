import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { translateAuthError } from '@/lib/authErrors';
import { AGENT_CONFIG, BRAND_CONFIG } from '@/config';

type View = 'login' | 'forgot';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Redirect any auth-callback hashes to /set-password so the dedicated
  // page can consume the token.
  useEffect(() => {
    const hash = window.location.hash;
    if (
      hash.includes('type=recovery') ||
      hash.includes('type=invite') ||
      hash.includes('type=signup') ||
      hash.includes('type=email_change') ||
      hash.includes('access_token')
    ) {
      navigate('/set-password' + hash, { replace: true });
    }
  }, [navigate]);

  // Show "session expired" banner when redirected here mid-use.
  useEffect(() => {
    if (searchParams.get('reason') === 'expired') {
      setError('Sesión expirada, inicia sesión de nuevo');
      const next = new URLSearchParams(searchParams);
      next.delete('reason');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Already logged in → straight to dashboard.
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Ingresa tu correo para enviarte el enlace.');
      return;
    }
    setResetting(true);
    const redirectTo =
      window.location.hostname === 'localhost'
        ? `${window.location.origin}/set-password`
        : `${AGENT_CONFIG.portal}/set-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setResetting(false);
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
    setInfo('Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-brand-primary tracking-tight">{BRAND_CONFIG.name}</h1>
          <p className="text-gray-500 text-sm">
            {view === 'forgot' ? 'Restablecer contraseña' : 'Portal de Agentes Inmobiliarios'}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-center">
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-2 text-center">
            {info}
          </p>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="agente@ejemplo.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(null); setInfo(null); }}
                className="text-xs text-brand-accent hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                />
                Recordarme
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5" />}
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                placeholder="agente@ejemplo.com"
              />
            </div>

            <button
              type="submit"
              disabled={resetting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent hover:bg-brand-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
            >
              {resetting && <Loader2 className="animate-spin h-5 w-5" />}
              Enviar link
            </button>

            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setInfo(null); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-brand-primary cursor-pointer"
            >
              <ArrowLeft size={14} />
              Volver
            </button>
          </form>
        )}

        <p className="text-xs text-center text-gray-500 pt-2 border-t border-gray-100">
          ¿No tienes acceso?{' '}
          <a
            href={BRAND_CONFIG.supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline font-medium"
          >
            Contacta a {BRAND_CONFIG.name}
          </a>
        </p>
      </div>
    </div>
  );
}
