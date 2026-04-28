'use client';

import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  onLogin?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogin = () => {}, onLogout = () => {}, isLoggedIn = false }) => {
  return (
    <div className="min-h-screen bg-primary text-primary font-sans selection:bg-accent/30">
      <Navbar onLogin={onLogin} onLogout={onLogout} isLoggedIn={isLoggedIn} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
        {children}
      </main>
      <footer className="border-t border-primary mt-auto py-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-secondary text-sm">
          <p>© 2026 Loomin. Built for distraction-free learning.</p>
        </div>
      </footer>
    </div>
  );
};
