import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = loc.state?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Inserisci email e password'); return; }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      nav(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message ?? 'Login fallito');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Accedi</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="tuo@email.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-violet-600 text-white py-2 font-semibold hover:bg-violet-700 disabled:opacity-60"
        >
          {submitting ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}
