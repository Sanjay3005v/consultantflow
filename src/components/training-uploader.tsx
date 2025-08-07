
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
import { analyzeCertificate, type AnalyzeCertificateResult } from '@/app/actions';
import { Upload, Loader2, CheckCircle, Award, Download } from 'lucide-react';
import type { Consultant } from '@/lib/types';
import jsPDF from 'jspdf';

const formSchema = z.object({
  certificate: z.custom<FileList>().refine((files) => files?.length === 1, 'Certificate is required.'),
});

type TrainingUploaderProps = {
  consultant: Consultant;
  onAnalysisComplete: (result: AnalyzeCertificateResult) => void;
};

export default function TrainingUploader({ consultant, onAnalysisComplete }: TrainingUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    report: string;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const downloadReport = (reportContent: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Training Feedback for ${consultant.name}`, 14, 22);
    doc.setFontSize(11);
    
    // Add the report text. The splitTextToSize function handles line breaks.
    const splitText = doc.splitTextToSize(reportContent, 180);
    doc.text(splitText, 14, 32);
    
    // Save the PDF
    doc.save(`training_feedback_${consultant.name.replace(/\s+/g, '_')}.pdf`);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);

    const file = values.certificate[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const dataUri = reader.result as string;
      try {
        const analysisResult = await analyzeCertificate(consultant.id, { certificateDataUri: dataUri });
        setResult({ report: analysisResult.report });
        onAnalysisComplete(analysisResult);
        toast({
          title: 'Analysis Complete',
          description: 'The certificate has been analyzed and a new skill has been added.',
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
    <Card className="bg-card/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span>Training Agent</span>
        </CardTitle>
        <CardDescription>Upload a training certificate to verify it and get actionable feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="certificate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      className="bg-transparent"
                      accept="image/*,.pdf"
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
                  Verifying...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Verify & Get Feedback
                </>
              )}
            </Button>
          </form>
        </Form>
        {result && (
            <Alert className="mt-6 bg-background/80">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Training Feedback</AlertTitle>
                <AlertDescription className="mt-2 space-y-4">
                   <p className="text-sm whitespace-pre-wrap">{result.report}</p>
                   <Button variant="outline" size="sm" onClick={() => downloadReport(result.report)} className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Report
                   </Button>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
