'use client';

import Link from 'next/link';
import { Briefcase, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const showLogout = pathname.startsWith('/consultant/') || pathname.startsWith('/admin');

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex flex-1 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              ConsultantFlow
            </span>
          </Link>
        </div>
        {showLogout && (
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
}
