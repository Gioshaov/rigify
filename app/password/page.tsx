'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
        router.refresh(); // Invalidate client-side cache to ensure fresh auth state
      } else {
        setError(data.error || 'Incorrect password');
        setPassword('');
      }
    } catch (err) {
      console.error('Password verification failed:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-md">
        <div className="text-center mb-stack-lg">
          <h1 className="font-mono text-data-label uppercase tracking-[0.2em] text-primary mb-stack-md">
            RIGIFY
          </h1>
          <p className="text-on-surface-variant">
            This site is password protected
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-stack-md" aria-label="Site password verification">
          <div>
            <label htmlFor="site-password" className="sr-only">
              Site Password
            </label>
            <input
              id="site-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              maxLength={200}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-error text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Enter Site'}
          </button>
        </form>
      </div>
    </main>
  );
}
