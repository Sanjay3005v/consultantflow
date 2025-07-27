
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { Award, CalendarCheck, FileText, Target, User, Download } from 'lucide-react';
import ResumeAnalyzer from '@/components/resume-analyzer';
import SkillsDisplay from '@/components/skills-display';
import StatusCard from '@/components/status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WorkflowTracker from '@/components/workflow-tracker';
import type { Consultant } from '@/lib/types';
import type { AnalyzeCertificateResult, AnalyzeResumeResult } from '@/app/actions';
import AttendanceFeedback from './attendance-feedback';
import { Button } from './ui/button';
import { format } from 'date-fns';
import TrainingUploader from './training-uploader';

export default function ConsultantDashboard({
  initialConsultant,
}: {
  initialConsultant: Consultant;
}) {
  const [consultant, setConsultant] = useState(initialConsultant);

  useEffect(() => {
    setConsultant(initialConsultant);
  }, [initialConsultant]);

  if (!consultant) {
    notFound();
  }

  const handleResumeAnalysisComplete = (result: AnalyzeResumeResult) => {
    setConsultant(result.consultant);
  };
  
  const handleCertificateAnalysisComplete = (result: AnalyzeCertificateResult) => {
    setConsultant(result.consultant);
  }

  const downloadAttendanceReport = () => {
    let reportContent = `Attendance Report for ${consultant.name}\n`;
    reportContent += '=====================================\n';
    reportContent += 'Date\t\tStatus\n';
    reportContent += '-------------------------------------\n';
    
    const sortedAttendance = [...consultant.attendance].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedAttendance.forEach(record => {
      reportContent += `${record.date}\t${record.status}\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${consultant.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const attendanceSummary = useMemo(() => {
    const completed = consultant.attendance.filter(
      (a) => a.status === 'Present'
    ).length;
    const total = consultant.attendance.length;
    return {
      completed,
      total,
      missed: total - completed,
    };
  }, [consultant.attendance]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center space-x-4">
        <User className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{consultant.name}</h1>
          <p className="text-muted-foreground">
            {consultant.department} Department
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Resume Status"
          value={consultant.workflow?.resumeUpdated ? 'Updated' : 'Pending'}
          icon={FileText}
          variant={consultant.workflow?.resumeUpdated ? 'success' : 'warning'}
        />
        <StatusCard
          title="Attendance"
          value={`${attendanceSummary.completed} / ${attendanceSummary.total} Meetings`}
          description="Completed / Total"
          icon={CalendarCheck}
        />
        <StatusCard
          title="Opportunities"
          value={consultant.opportunities.toString()}
          description="Provided during bench"
          icon={Target}
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
                <Card>
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
                    <Button onClick={downloadAttendanceReport} variant="outline" className='w-full'>
                        <Download className="mr-2 h-4 w-4" />
                        Download Attendance Report
                    </Button>
                </div>
           </div>
           <SkillsDisplay skills={consultant.skills} />
        </div>

        <div className="space-y-8">
             <ResumeAnalyzer
                consultant={consultant}
                onAnalysisComplete={handleResumeAnalysisComplete}
                />
             <TrainingUploader
                consultant={consultant}
                onAnalysisComplete={handleCertificateAnalysisComplete}
              />
        </div>
      </div>
    </div>
  );
}
