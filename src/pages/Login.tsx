import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const AUTH_STORAGE_KEY = 'tuwebsv-auth';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // If "remember me" is off, move the session out of localStorage so it
    // dies with the tab (sessionStorage is cleared on tab close, and the
    // supabase client only reads from localStorage on init).
    if (!remember) {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          sessionStorage.setItem(AUTH_STORAGE_KEY, stored);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        // ignore storage errors
      }
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Ingresa tu correo para enviarte el enlace de restablecimiento.');
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetting(false);
    if (error) {
      setError(error.message);
    } else {
      setInfo('Te enviamos un correo con instrucciones para restablecer tu contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-brand-primary tracking-tight">TuWebSV</h1>
          <p className="text-gray-500 text-sm">Portal de Agentes Inmobiliarios</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetting}
              className="text-brand-accent hover:underline cursor-pointer disabled:opacity-60"
            >
              {resetting ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
            </button>
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

        <p className="text-xs text-center text-gray-500 pt-2 border-t border-gray-100">
          ¿No tienes acceso?{' '}
          <a
            href="https://tuwebsv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent hover:underline font-medium"
          >
            Contacta a TuWebSV
          </a>
        </p>
      </div>
    </div>
  );
}
