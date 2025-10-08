import React from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Invoicing Dashboard</h1>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container p-4">
        <Outlet />
      </main>
    </div>
  );
};
