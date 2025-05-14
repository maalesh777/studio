// src/components/core/Header.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sparkles, Library, Camera } from 'lucide-react'; // Icons for navigation

const navItems = [
  { href: '/', label: 'Generate', icon: Sparkles },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/ar-preview', label: 'AR Preview', icon: Camera },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            <path d="M12 22V12" />
            <path d="M17 9l5-2.5" />
            <path d="M7 9L2 6.5" />
          </svg>
          <span className="text-2xl font-bold tracking-tighter animated-gradient-text">
            TattooAI:Vision
          </span>
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground/80 hover:text-foreground',
                  'relative' // For potential future animations/indicators
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <Icon className="mr-0 h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">{item.label}</span>
                 {/* Animated underline effect */}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out group-hover:w-full",
                    pathname === item.href ? "w-full" : "w-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
