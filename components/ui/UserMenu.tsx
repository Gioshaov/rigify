'use client'

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);
      setLoading(false);
    }
    loadUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowDropdown(false);
    router.push('/');
  }

  if (loading) {
    return (
      <div className="w-10 h-10 bg-surface-container-high border border-white/10 flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">person</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        data-testid="sign-in-btn"
        href="/login"
        className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-testid="user-menu-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Account menu"
        aria-expanded={showDropdown}
        className="w-10 h-10 bg-surface-container-high border border-primary/20 shadow-md shadow-primary/30 flex items-center justify-center hover:border-primary hover:shadow-lg hover:shadow-primary/50 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">person</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-white/10 shadow-lg z-50">
          <div className="p-3 border-b border-white/10">
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase truncate">
              {user.email}
            </p>
          </div>
          <div className="p-2">
            <Link
              data-testid="dropdown-my-bookings"
              href="/customer/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">event_available</span>
              <span className="font-hanken text-[14px] leading-[1.5] font-normal">My Bookings</span>
            </Link>
            <Link
              data-testid="dropdown-profile"
              href="/customer/dashboard/profile"
              className="flex items-center gap-2 px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
              <span className="font-hanken text-[14px] leading-[1.5] font-normal">Profile</span>
            </Link>
            <button
              data-testid="dropdown-sign-out"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
              <span className="font-hanken text-[14px] leading-[1.5] font-normal">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
