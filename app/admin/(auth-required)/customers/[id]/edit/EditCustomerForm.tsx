'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateCustomer } from '../../actions';
import { User, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  has_used_emergency_cancel: boolean;
  created_at: string;
};

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateCustomer(customer.id, formData);

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          router.push(`/admin/customers/${customer.id}`);
        }, 1000);
      }
    });
  };

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* Main Form Column */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">Edit Customer</h1>
          <Link
            href={`/admin/customers/${customer.id}`}
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
            data-testid="edit-customer-back-btn"
          >
            ← Back to Details
          </Link>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mx-8 mt-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e]'
                : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
            }`}
            data-testid="edit-customer-message"
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Section: Customer Information */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-[#cccccc] text-sm mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={customer.name}
                  data-testid="edit-customer-name-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  required
                  minLength={2}
                  maxLength={100}
                />
                <p className="text-[#888888] text-xs mt-1">2-100 characters</p>
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-[#cccccc] text-sm mb-1.5">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={customer.phone}
                  data-testid="edit-customer-phone-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                  required
                  pattern="^\+995\d{9}$"
                  placeholder="+995XXXXXXXXX"
                />
                <p className="text-[#888888] text-xs mt-1">Georgian format: +995XXXXXXXXX</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={customer.email}
                  data-testid="edit-customer-email-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                  required
                />
                <p className="text-[#888888] text-xs mt-1">Must be a valid email address</p>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              data-testid="edit-customer-submit-btn"
              className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-sm px-6 py-2.5 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[300px] bg-[#111111] border-l border-[#2a2a2a] flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Status Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Current Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-[#cccccc] text-sm">Status</span>
              <span
                className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                  customer.status === 'active'
                    ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]'
                    : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]'
                }`}
              >
                {customer.status}
              </span>
            </div>
            <p className="text-[#888888] text-xs mt-2">
              Change status from the customer detail page
            </p>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Emergency Cancel Panel (Read-only) */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Emergency Cancel</h3>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                {customer.has_used_emergency_cancel ? (
                  <>
                    <XCircle className="w-4 h-4 text-[#ef4444]" />
                    <span className="text-[#ef4444] text-sm font-mono uppercase">Used</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-[#22c55e] text-sm font-mono uppercase">Available</span>
                  </>
                )}
              </div>
              <p className="text-[#888888] text-xs">
                ⚠️ Read-only: One-time lifetime flag managed by system only
              </p>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Info Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Important</h3>
            <div className="space-y-2 text-[#888888] text-xs">
              <p>• Email must be unique across all customers</p>
              <p>• Phone number must be in Georgian format</p>
              <p>• Emergency cancel flag cannot be edited manually</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
