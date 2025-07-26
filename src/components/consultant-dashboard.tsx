
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { Award, CalendarCheck, FileText, Target, User } from 'lucide-react';
import ResumeAnalyzer from '@/components/resume-analyzer';
import SkillsDisplay from '@/components/skills-display';
import StatusCard from '@/components/status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WorkflowTracker from '@/components/workflow-tracker';
import type { Consultant } from '@/lib/types';
import type { AnalyzeResumeResult } from '@/app/actions';

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

  const handleAnalysisComplete = (result: AnalyzeResumeResult) => {
    setConsultant(result.consultant);
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
          <SkillsDisplay skills={consultant.skills} />
        </div>

        <ResumeAnalyzer
          consultant={consultant}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </div>
    </div>
  );
}
