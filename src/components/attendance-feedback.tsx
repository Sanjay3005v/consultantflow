
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getAttendanceFeedback } from '@/app/actions';
import { Loader2, Sparkles, MessageSquareQuote, Download } from 'lucide-react';
import type { Consultant } from '@/lib/types';
import { format } from 'date-fns';

type AttendanceFeedbackProps = {
  consultant: Consultant;
  onDownloadReport: () => void;
};

export default function AttendanceFeedback({ consultant, onDownloadReport }: AttendanceFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { toast } = useToast();

  const attendanceSummary = useMemo(() => {
    const presentDays = consultant.presentDays;
    const totalDays = consultant.totalWorkingDays;
    const paidLeavesTaken = 0; // Assuming no data for this yet.
    const paidLeavesRemaining = 2; // Assuming a default value.
    
    return {
      presentDays,
      totalDays,
      paidLeavesTaken,
      paidLeavesRemaining,
    };
  }, [consultant.presentDays, consultant.totalWorkingDays]);

  async function handleGetFeedback() {
    setLoading(true);
    setFeedback(null);

    try {
      const result = await getAttendanceFeedback({
        consultantName: consultant.name,
        month: format(new Date(), 'MMMM'), // Current month
        totalDays: attendanceSummary.totalDays,
        presentDays: attendanceSummary.presentDays,
        paidLeavesTaken: attendanceSummary.paidLeavesTaken,
        paidLeavesRemaining: attendanceSummary.paidLeavesRemaining,
      });
      setFeedback(result.feedbackMessage);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Feedback Generation Failed',
        description: 'Something went wrong while contacting the AI agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-primary" />
            <span>Attendance Feedback</span>
        </CardTitle>
        <CardDescription>
          Get AI-powered feedback on attendance and suggestions for improvement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted/60 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Attendance</p>
            <p className="text-3xl font-bold">{attendanceSummary.presentDays} / {attendanceSummary.totalDays}</p>
            <p className="text-xs text-muted-foreground">(Present / Total Logged Days)</p>
        </div>

        <div className="space-y-2">
            <Button onClick={handleGetFeedback} disabled={loading} className="w-full">
            {loading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Feedback...
                </>
            ) : (
                <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Feedback
                </>
            )}
            </Button>
            <Button onClick={onDownloadReport} variant="outline" className='w-full bg-transparent'>
                <Download className="mr-2 h-4 w-4" />
                Download Attendance Report
            </Button>
        </div>

        {feedback && (
          <Alert className="bg-background/80">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>AI Generated Feedback</AlertTitle>
            <AlertDescription className="mt-2 whitespace-pre-wrap">
              {feedback}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
