
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
import { analyzeResume, trackResumeEvolution, type AnalyzeResumeResult, type TrackResumeEvolutionResult } from '@/app/actions';
import { Upload, Loader2, CheckCircle, BrainCircuit, TrendingUp, ArrowRight } from 'lucide-react';
import type { Consultant, SkillAnalysis } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';


const formSchema = z.object({
  resume: z.custom<FileList>().refine((files) => files?.length === 1, 'Resume is required.'),
});

type ResumeAnalyzerProps = {
  consultant: Consultant;
  onAnalysisComplete: (result: AnalyzeResumeResult | TrackResumeEvolutionResult) => void;
};

export default function ResumeAnalyzer({ consultant, onAnalysisComplete }: ResumeAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ feedback: string; historyLog: string } | null>(null);
  const [evolutionResult, setEvolutionResult] = useState<TrackResumeEvolutionResult['evolutionData'] | null>(null);

  const [isResultOpen, setIsResultOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const hasExistingSkills = Array.isArray(consultant.skills) && consultant.skills.length > 0 && typeof consultant.skills[0] === 'object';


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setAnalysisResult(null);
    setEvolutionResult(null);
    setIsResultOpen(false);

    const file = values.resume[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const dataUri = reader.result as string;
      try {
        if (hasExistingSkills) {
          // Track evolution if skills already exist
          const result = await trackResumeEvolution(consultant.id, { 
              newResumeDataUri: dataUri,
              previousSkillAnalysis: consultant.skills as SkillAnalysis[]
          });
          setEvolutionResult(result.evolutionData);
          onAnalysisComplete(result);
           toast({
            title: 'Evolution Analysis Complete',
            description: 'Your resume changes have been successfully analyzed.',
          });
        } else {
          // Perform initial analysis
          const result = await analyzeResume(consultant.id, { resumeDataUri: dataUri });
          setAnalysisResult({ feedback: result.feedback, historyLog: result.historyLog });
          onAnalysisComplete(result);
          toast({
            title: 'Analysis Complete',
            description: 'The resume has been successfully analyzed and skills have been updated.',
          });
        }
        setIsResultOpen(true);
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

  const getChangeBadge = (change: string) => {
    switch (change) {
      case 'Added': return <Badge variant="default" className="bg-green-600">Added</Badge>;
      case 'Improved': return <Badge variant="default" className="bg-blue-600">Improved</Badge>;
      case 'Decreased': return <Badge variant="destructive">Decreased</Badge>;
      case 'Removed': return <Badge variant="destructive">Removed</Badge>;
      default: return <Badge variant="secondary">Unchanged</Badge>;
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>AI Resume Analyzer</CardTitle>
        <CardDescription>
            {hasExistingSkills 
                ? 'Upload an updated resume to track your skill evolution.' 
                : 'Upload a resume to extract, rate, and get feedback on skills.'
            }
        </CardDescription>
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
                      className="bg-transparent"
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
              ) : hasExistingSkills ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Track Evolution
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
        <Collapsible open={isResultOpen} onOpenChange={setIsResultOpen} className="mt-6 space-y-4">
          <CollapsibleContent>
            {analysisResult && (
                <Alert className="bg-background/80">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Successful!</AlertTitle>
                  <AlertDescription>
                      <div className="space-y-4 mt-2">
                      <div>
                          <h4 className="font-semibold flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4" />
                          Training Feedback
                          </h4>
                          <Card className="mt-2 p-3 bg-muted/50">
                          <p className="text-sm whitespace-pre-wrap">{analysisResult.feedback}</p>
                          </Card>
                      </div>
                      
                      <div>
                          <h4 className="font-semibold pt-2">History Log:</h4>
                          <ScrollArea className="h-24 w-full rounded-md border p-2 bg-muted/50">
                          <p className="text-sm">{analysisResult.historyLog}</p>
                          </ScrollArea>
                      </div>
                      </div>
                  </AlertDescription>
                </Alert>
            )}

            {evolutionResult && (
                <Alert className="bg-background/80">
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Resume Evolution Report</AlertTitle>
                  <AlertDescription className="mt-2 space-y-4">
                     <div>
                        <h4 className="font-semibold">Overall Score</h4>
                         <div className="flex items-center gap-4 mt-2">
                            <div className='text-center'>
                                <p className='text-xs text-muted-foreground'>Old Score</p>
                                <p className='text-2xl font-bold'>{evolutionResult.oldOverallScore.toFixed(1)}</p>
                            </div>
                            <ArrowRight className='h-5 w-5 text-muted-foreground' />
                             <div className='text-center'>
                                <p className='text-xs text-muted-foreground'>New Score</p>
                                <p className='text-2xl font-bold text-primary'>{evolutionResult.newOverallScore.toFixed(1)}</p>
                            </div>
                         </div>
                     </div>

                     <div>
                        <h4 className="font-semibold pt-2">Summary of Improvements</h4>
                         <Card className="mt-2 p-3 bg-muted/50">
                            <p className="text-sm whitespace-pre-wrap">{evolutionResult.summaryOfImprovements}</p>
                         </Card>
                     </div>
                     
                     {evolutionResult.suggestions && (
                         <div>
                            <h4 className="font-semibold pt-2">Suggestions for Next Time</h4>
                             <Card className="mt-2 p-3 bg-muted/50">
                                <p className="text-sm whitespace-pre-wrap">{evolutionResult.suggestions}</p>
                             </Card>
                         </div>
                     )}

                      <div>
                          <h4 className="font-semibold pt-2">Skill Changes</h4>
                           <Card className="mt-2 p-0 bg-muted/50">
                               <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Skill</TableHead>
                                            <TableHead>Change</TableHead>
                                            <TableHead className="text-right">Rating</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {evolutionResult.skillChanges.map((change) => (
                                            <TableRow key={change.skill}>
                                                <TableCell>{change.skill}</TableCell>
                                                <TableCell>{getChangeBadge(change.change)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                {change.oldRating !== null && change.newRating !== null && change.oldRating !== change.newRating
                                                    ? `${change.oldRating} → ${change.newRating}`
                                                    : change.newRating ?? change.oldRating}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           </Card>
                      </div>

                  </AlertDescription>
                </Alert>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
