
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { verifyConsultantCredentials } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await verifyConsultantCredentials(values);
      if (result.consultantId) {
        toast({
          title: 'Login Successful!',
          description: "You've been successfully logged in.",
        });
        router.push(`/consultant/${result.consultantId}`);
      } else {
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
       toast({
          title: 'Login Failed',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/30 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                   <FormControl>
                        <Input className="bg-transparent" type="email" placeholder="you@company.com" {...field} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                   <FormControl>
                        <Input className="bg-transparent" type="password" placeholder="********" {...field} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading} className="w-full mt-6">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
