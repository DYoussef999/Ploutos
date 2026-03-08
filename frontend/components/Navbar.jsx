'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const navLinks = [
  { label: 'Dashboard', href: '/' },
  { label: 'Financial Sandbox', href: '/sandbox' },
  { label: 'Expansion Map', href: '/expansion' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useUser();

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.09 14.09 0 006.16-12.12A14.05 14.05 0 009.63 2.25a14.09 14.09 0 00-5.84 12.12m11.8 0a6 6 0 01-5.84 2.56m0 0a6 6 0 01-5.84-7.38m5.84 7.38v4.82"
              />
            </svg>
            <span className="text-white font-bold text-lg tracking-tight">
              LaunchPad <span className="text-green-400">AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-green-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons (desktop) */}
          {!isLoading && (
            <div className="hidden md:flex items-center gap-3 ml-4">
              {user ? (
                <>
                  <span className="text-green-400 text-sm font-medium truncate max-w-[140px]">
                    {user.name || user.email}
                  </span>
                  <a
                    href="/api/auth/logout"
                    className="text-sm text-slate-300 border border-slate-600 px-4 py-1.5 rounded-lg hover:border-green-400 hover:text-white transition"
                  >
                    Sign out
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/api/auth/login?returnTo=/dashboard"
                    className="text-sm text-slate-300 border border-slate-600 px-4 py-1.5 rounded-lg hover:border-green-400 hover:text-white transition"
                  >
                    Sign in
                  </a>
                  <a
                    href="/api/auth/login?screen_hint=signup&returnTo=/dashboard"
                    className="text-sm font-semibold bg-white text-slate-900 px-4 py-1.5 rounded-lg hover:bg-slate-100 transition shadow-sm"
                  >
                    Get started &rarr;
                  </a>
                </>
              )}
            </div>
          )}

          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900 px-6 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-green-400 bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!isLoading && (
            <div className="pt-3 mt-2 border-t border-slate-700/50 flex flex-col gap-2">
              {user ? (
                <>
                  <span className="text-green-400 text-sm font-medium px-3 truncate">{user.name || user.email}</span>
                  <a href="/api/auth/logout" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                    Sign out
                  </a>
                </>
              ) : (
                <>
                  <a href="/api/auth/login?returnTo=/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                    Sign in
                  </a>
                  <a href="/api/auth/login?screen_hint=signup&returnTo=/dashboard" className="block px-3 py-2 rounded-lg text-sm font-semibold bg-white text-slate-900 text-center transition">
                    Get started &rarr;
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
