
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { Award, CalendarCheck, FileText, Target, User, Download, ClipboardCheck, MessageSquare } from 'lucide-react';
import ResumeAnalyzer from '@/components/resume-analyzer';
import SkillsDisplay from '@/components/skills-display';
import StatusCard from '@/components/status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WorkflowTracker from '@/components/workflow-tracker';
import type { Consultant } from '@/lib/types';
import type { AnalyzeCertificateResult, AnalyzeResumeResult, TrackResumeEvolutionResult } from '@/app/actions';
import { updateConsultantOpportunities } from '@/app/actions';
import AttendanceFeedback from './attendance-feedback';
import { Button } from './ui/button';
import TrainingUploader from './training-uploader';
import OpportunityCenter from './opportunity-center';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ConsultantChatbot from './consultant-chatbot';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import RecommendedTraining from './recommended-training';
import ResumeEvolutionReport from './resume-evolution-report';

export default function ConsultantDashboard({
  initialConsultant,
}: {
  initialConsultant: Consultant;
}) {
  const [consultant, setConsultant] = useState(initialConsultant);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [evolutionResult, setEvolutionResult] = useState<TrackResumeEvolutionResult['evolutionData'] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setConsultant(initialConsultant);
  }, [initialConsultant]);

  if (!consultant) {
    notFound();
  }

  const handleAnalysisComplete = (result: AnalyzeResumeResult | TrackResumeEvolutionResult) => {
    setConsultant(result.consultant);
    // Check if the result is from the evolution tracker and has evolutionData
    if ('evolutionData' in result) {
      setEvolutionResult(result.evolutionData);
    } else {
      setEvolutionResult(null); // Reset if it's a standard analysis
    }
  };
  
  const handleCertificateAnalysisComplete = (result: AnalyzeCertificateResult) => {
    setConsultant(result.consultant);
  }

  const handleAllocationComplete = async (opportunityCount: number) => {
    try {
        const updatedConsultant = await updateConsultantOpportunities(consultant.id, opportunityCount);
        if (updatedConsultant) {
            setConsultant(updatedConsultant);
            toast({
                title: "Opportunities Updated!",
                description: `${opportunityCount} new project opportunities have been documented.`,
            });
        }
    } catch (error) {
        console.error("Failed to update opportunities:", error);
        toast({
            title: "Update Failed",
            description: "Could not update the opportunities count.",
            variant: "destructive",
        });
    }
  };

  const downloadAttendanceReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Attendance Report for ${consultant.name}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Summary: ${consultant.presentDays} Present / ${consultant.totalWorkingDays} Total Logged Days`, 14, 30);
    
    let yPos = 40;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Date', 14, yPos);
    doc.text('Status', 50, yPos);
    yPos += 2;
    doc.line(14, yPos, 196, yPos); // Horizontal line
    yPos += 8;

    doc.setFont(undefined, 'normal');

    const sortedAttendance = [...consultant.attendance]
      .filter(record => record.date) // Filter out placeholder/invalid records
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedAttendance.forEach(record => {
      if (yPos > 280) {
          doc.addPage();
          yPos = 20;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text('Date', 14, yPos);
          doc.text('Status', 50, yPos);
          yPos += 2;
          doc.line(14, yPos, 196, yPos);
          yPos += 8;
          doc.setFont(undefined, 'normal');
      }

      doc.text(record.date, 14, yPos);
      doc.text(record.status, 50, yPos);
      yPos += 7;
    });

    doc.save(`attendance_report_${consultant.name.replace(/\s+/g, '_')}.pdf`);
  };

  const attendanceSummary = useMemo(() => {
    const present = consultant.presentDays;
    const total = consultant.totalWorkingDays;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      present,
      total,
      percentage,
    };
  }, [consultant.presentDays, consultant.totalWorkingDays]);

  return (
    <div className="relative min-h-[calc(100vh-57px)] overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 h-full w-full bg-background" />
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
            <div className="absolute bottom-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
        </div>
        <div className="relative z-10 container mx-auto p-4 md:p-8">
            <div className="mb-8 flex items-center space-x-4">
                <User className="h-12 w-12 text-primary" />
                <div>
                <h1 className="text-3xl font-bold">{consultant.name}</h1>
                <p className="text-muted-foreground">
                    {consultant.department} Department
                </p>
                </div>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <StatusCard
                title="Project Status"
                value={consultant.status}
                icon={ClipboardCheck}
                variant={consultant.status === 'On Project' ? 'success' : 'info'}
                />
                <StatusCard
                title="Resume Status"
                value={consultant.workflow?.resumeUpdated ? 'Updated' : 'Pending'}
                icon={FileText}
                variant={consultant.workflow?.resumeUpdated ? 'success' : 'warning'}
                />
                <StatusCard
                title="Attendance"
                value={`${attendanceSummary.percentage}%`}
                description={`${attendanceSummary.present} / ${attendanceSummary.total} Days Present`}
                icon={CalendarCheck}
                />
                <StatusCard
                title="Opportunities"
                value={consultant.opportunities.toString()}
                description="Provided during bench"
                icon={Target}
                variant={consultant.opportunities > 0 ? 'success' : 'default'}
                />
                <StatusCard
                title="Training"
                value={consultant.training}
                icon={Award}
                variant={
                    consultant.training === 'Completed'
                    ? 'success'
                    : consultant.training === 'In Progress'
                    ? 'info'
                    : 'default'
                }
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                <div className="grid gap-8 md:grid-cols-2">
                        <Card className="bg-card/60 backdrop-blur-xl">
                            <CardHeader>
                            <CardTitle>Workflow Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                            {consultant.workflow && (
                                <WorkflowTracker workflow={consultant.workflow} />
                            )}
                            </CardContent>
                        </Card>
                        <div className='space-y-4'>
                            <AttendanceFeedback consultant={consultant} />
                            <Button onClick={downloadAttendanceReport} variant="outline" className='w-full bg-card/60 backdrop-blur-xl'>
                                <Download className="mr-2 h-4 w-4" />
                                Download Attendance Report
                            </Button>
                        </div>
                </div>
                <SkillsDisplay skills={consultant.skills} />
                {evolutionResult && <ResumeEvolutionReport evolutionData={evolutionResult} />}
                <OpportunityCenter consultant={consultant} onAllocationComplete={handleAllocationComplete} />
                </div>

                <div className="space-y-8">
                    <ResumeAnalyzer
                        consultant={consultant}
                        onAnalysisComplete={handleAnalysisComplete}
                        />
                    <TrainingUploader
                        consultant={consultant}
                        onAnalysisComplete={handleCertificateAnalysisComplete}
                    />
                    <RecommendedTraining skills={consultant.skills} />
                </div>
            </div>
        </div>
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
            <DialogTrigger asChild>
                <Button
                variant="default"
                className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg"
                >
                <MessageSquare className="w-8 h-8" />
                <span className="sr-only">Open Chat</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 bg-card/80 backdrop-blur-xl">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Consultant Assistant</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-hidden">
                    <ConsultantChatbot consultantId={consultant.id} />
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
