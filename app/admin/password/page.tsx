'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin'); // Go to admin root - will redirect to login if not authenticated
        router.refresh(); // Invalidate client-side cache
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[#d4a843] text-4xl font-bold uppercase tracking-widest mb-2">
            RIGIFY
          </h1>
          <p className="text-[#888888] text-[11px] uppercase tracking-widest">
            SUPER ADMIN
          </p>
          <div className="mt-6">
            <p className="text-[#cccccc] text-sm">
              This admin panel is password protected
            </p>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-[#cccccc] mb-2">
                Access Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                maxLength={200}
                data-testid="admin-password-input"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white text-sm placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#d4a843] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              data-testid="admin-password-submit"
              disabled={loading || !password}
              className="w-full bg-[#d4a843] hover:brightness-110 disabled:bg-[#d4a843]/50 text-black py-3 px-4 rounded font-semibold transition-all disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-xs text-yellow-200">
                Restricted access. All authentication attempts are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
