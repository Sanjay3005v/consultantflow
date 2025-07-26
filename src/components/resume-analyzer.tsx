
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { analyzeResume } from '@/app/actions';
import { Upload, Loader2, CheckCircle, BrainCircuit } from 'lucide-react';
import type { Consultant } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const formSchema = z.object({
  resume: z.custom<FileList>().refine((files) => files?.length === 1, 'Resume is required.'),
});

type ResumeAnalyzerProps = {
  consultant: Consultant;
  onAnalysisComplete: (updatedConsultant: Consultant) => void;
};

export default function ResumeAnalyzer({ consultant, onAnalysisComplete }: ResumeAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    feedback: string;
    historyLog: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setIsOpen(false);

    const file = values.resume[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const dataUri = reader.result as string;
      try {
        const { consultant: updatedConsultant, feedback, historyLog } = await analyzeResume(consultant.id, { resumeDataUri: dataUri });
        setResult({ feedback, historyLog });
        onAnalysisComplete(updatedConsultant);
        setIsOpen(true);
        toast({
          title: 'Analysis Complete',
          description: 'The resume has been successfully analyzed and skills have been updated.',
          variant: 'default',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Analysis Failed',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        variant: 'destructive',
      });
      setLoading(false);
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resume Analyzer</CardTitle>
        <CardDescription>Upload a resume to extract, rate, and get feedback on skills.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </form>
        </Form>
        {result && (
           <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6 space-y-4">
            <CollapsibleContent>
                <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Analysis Successful!</AlertTitle>
                <AlertDescription>
                    <div className="space-y-4 mt-2">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        Training Feedback
                        </h4>
                        <Card className="mt-2 p-3">
                        <p className="text-sm">{result.feedback}</p>
                        </Card>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold pt-2">History Log:</h4>
                        <ScrollArea className="h-24 w-full rounded-md border p-2">
                        <p className="text-sm">{result.historyLog}</p>
                        </ScrollArea>
                    </div>
                    </div>
                </AlertDescription>
                </Alert>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
