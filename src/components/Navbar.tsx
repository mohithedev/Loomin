'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Star, LogOut, Layout as LayoutIcon, PlusCircle, User, Zap, Menu, X } from 'lucide-react';
import { ThemeMode } from '../types';
import { getCurrentUser } from '../services/auth';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  onLogin: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogin, onLogout = () => { }, isLoggedIn = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentUser(getCurrentUser());
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const nextTheme: Record<ThemeMode, ThemeMode> = {
    light: 'dark',
    dark: 'midnight',
    midnight: 'light',
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    router.push('/#pricing');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary bg-primary/80 backdrop-blur-md">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutIcon className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-xl font-bold tracking-tight">Loomin</span>
          </Link>

          {/* Center - Home & Pricing Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-1 justify-center">
            <Link
              href="/"
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handlePricingClick}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all"
            >
              Pricing
            </button>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(nextTheme[theme])}
              className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-secondary text-xs font-semibold flex items-center gap-1 border border-primary hover:border-accent"
              title="Switch Theme"
            >
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'midnight' && <Star className="w-4 h-4" />}
              <span className="hidden sm:inline capitalize text-xs lg:text-xs">{theme}</span>
            </button>

            {/* Desktop - Sign In & Get Started (Guest Only) */}
            {!currentUser && (
              <>
                <button
                  onClick={onLogin}
                  className="hidden sm:block px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onLogin}
                  className="hidden sm:flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 text-xs lg:text-sm border border-accent"
                >
                  <span>Get Started</span>
                </button>
              </>
            )}

            {/* Desktop - User Info & Logout */}
            {currentUser && (
              <>
                <div className="h-6 w-px bg-primary hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-secondary/50 rounded-lg">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-xs lg:text-sm font-semibold text-primary truncate max-w-[100px]">{currentUser.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="hidden sm:flex px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all cursor-pointer items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            )}

            {/* Desktop - Upgrade/Pro & Create (Logged In) */}
            {currentUser && (
              <>
                {currentUser.plan === 'free' && (
                  <button
                    onClick={() => {
                      if (pathname === '/') {
                        const pricingSection = document.getElementById('pricing');
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        router.push('/#pricing');
                      }
                    }}
                    className="hidden sm:flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 text-xs lg:text-sm border border-accent"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Upgrade</span>
                  </button>
                )}

                {currentUser.plan === 'pro' && (
                  <div className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-accent/20 border border-accent/40 text-accent rounded-lg">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold">Pro</span>
                  </div>
                )}

                <button className="hidden sm:flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 text-xs lg:text-sm border border-accent">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden lg:inline">Create</span>
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-secondary border border-primary hover:border-accent"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-primary py-4 space-y-3 pb-4">
            {/* Home & Pricing */}
            <Link
              href="/"
              className="block w-full px-4 py-2 text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all text-left"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handlePricingClick}
              className="w-full px-4 py-2 text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all text-left"
            >
              Pricing
            </button>

            {/* Guest Menu */}
            {!currentUser && (
              <>
                <button
                  onClick={onLogin}
                  className="w-full px-4 py-2 text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all cursor-pointer text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={onLogin}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 text-sm border border-accent justify-center"
                >
                  <span>Get Started</span>
                </button>
              </>
            )}

            {/* User Menu */}
            {currentUser && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-primary truncate">{currentUser.name}</span>
                </div>

                {currentUser.plan === 'free' && (
                  <button
                    onClick={() => {
                      if (pathname === '/') {
                        const pricingSection = document.getElementById('pricing');
                        if (pricingSection) {
                          pricingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        router.push('/#pricing');
                      }
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 text-sm border border-accent justify-center"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Upgrade</span>
                  </button>
                )}

                {currentUser.plan === 'pro' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 text-accent rounded-lg justify-center">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-bold">Pro</span>
                  </div>
                )}

                <button className="w-full flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-bold cursor-pointer shadow-lg shadow-accent/20 text-sm border border-accent justify-center">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-sm font-semibold text-secondary hover:text-primary border border-primary hover:border-accent rounded-lg transition-all cursor-pointer text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
