import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/components/forms/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OAuthButton } from '@/components/ui/oauth-button'; // From login-03
import { Icons } from '@/components/icons'; // Assume from block

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth buttons from login-03 */}
          <div className="grid gap-6">
            <OAuthButton
              variant="outline"
              className="w-full"
              icon={Icons.gitHub}
              onClick={() => { /* TODO */ }}
            >
              Continue with GitHub
            </OAuthButton>
            <OAuthButton
              variant="outline"
              className="w-full"
              icon={Icons.google}
              onClick={() => { /* TODO */ }}
            >
              Continue with Google
            </OAuthButton>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <LoginForm onSuccess={handleSuccess} />
        </CardContent>
        <CardDescription className="py-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Register here
          </Link>
        </CardDescription>
      </Card>
    </div>
  );
};
