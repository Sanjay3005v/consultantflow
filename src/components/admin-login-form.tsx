
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
import { verifyAdminCredentials } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).refine(email => email.endsWith('@hexaware.com'), {
    message: 'Email must be a valid @hexaware.com address.',
  }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
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
      await verifyAdminCredentials(values);
      // This part might not be reached if redirect is thrown, which is expected.
      toast({
        title: 'Admin Login Successful!',
      });
    } catch (error: any) {
        // Next.js's redirect throws an error, so we need to check for it and re-throw it.
        if (error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }
       toast({
          title: 'Login Failed',
          description: error.message || 'Invalid admin credentials.',
          variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Admin Access</CardTitle>
        <CardDescription>Enter your credentials to access the admin console.</CardDescription>
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
                        <Input className="bg-transparent" type="email" placeholder="admin@hexaware.com" {...field} />
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
