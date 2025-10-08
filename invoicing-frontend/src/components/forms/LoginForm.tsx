import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Login successful", {
        description: "Welcome back!",
      });
      onSuccess?.();
    } catch (error: any) {
      setError('root', { message: error.response?.data?.error || 'Login failed' });
      toast.error("Login failed", {
        description: error.response?.data?.error || 'Invalid credentials',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <div>
            <Input
              placeholder="Email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
