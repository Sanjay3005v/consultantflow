
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAllConsultants } from '@/lib/data';

const formSchema = z.object({
  consultantId: z.string().min(1, { message: 'Please select a consultant.' }),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const consultants = getAllConsultants();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        consultantId: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Redirect to the selected consultant's dashboard
    router.push(`/consultant/${values.consultantId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultant Login</CardTitle>
        <CardDescription>Select a consultant to view their dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="consultantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Consultant</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a consultant profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {consultants.map(consultant => (
                         <SelectItem key={consultant.id} value={consultant.id}>
                            {consultant.name}
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
