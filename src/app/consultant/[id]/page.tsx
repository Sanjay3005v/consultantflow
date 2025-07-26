
'use client';

import React from 'react';
import { getConsultantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { User, FileText, CalendarCheck, Target, Award } from 'lucide-react';
import StatusCard from '@/components/status-card';
import WorkflowTracker from '@/components/workflow-tracker';
import ResumeAnalyzer from '@/components/resume-analyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Consultant, SkillAnalysis } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import SkillsDisplay from '@/components/skills-display';

// This is a new component that contains the original client-side logic
function ConsultantDashboard({ initialConsultant }: { initialConsultant: Consultant }) {
  const [consultant, setConsultant] = useState(initialConsultant);
  
  useEffect(() => {
    // Keep local state in sync if the initial consultant prop changes
    // This can happen if the parent component re-renders with new data.
    setConsultant(initialConsultant);
  }, [initialConsultant]);

  if (!consultant) {
    notFound();
  }

  const handleSkillsUpdate = () => {
    // Re-fetch the latest consultant data from our "DB" after analysis.
    // The data is updated on the server, so we need to get the fresh copy.
    const updatedConsultant = getConsultantById(consultant.id);
    if (updatedConsultant) {
      setConsultant(updatedConsultant);
    }
  };
  
  const attendanceSummary = useMemo(() => {
    const completed = consultant.attendance.filter(a => a.status === 'Present').length;
    const total = consultant.attendance.length;
    return {
        completed,
        total,
        missed: total-completed,
    }
  }, [consultant.attendance]);


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center space-x-4 mb-8">
        <User className="w-12 h-12 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{consultant.name}</h1>
          <p className="text-muted-foreground">{consultant.department} Department</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    {consultant.workflow && <WorkflowTracker workflow={consultant.workflow} />}
                </CardContent>
            </Card>
            <SkillsDisplay skills={consultant.skills} />
        </div>
        
        <ResumeAnalyzer consultant={consultant} onAnalysisComplete={handleSkillsUpdate} />
      </div>
    </div>
  );
}


export default function ConsultantPage({ params }: { params: { id: string } }) {
  const consultant = getConsultantById(React.use(params).id);
  
  if (!consultant) {
    notFound();
  }

  return <ConsultantDashboard initialConsultant={consultant} />;
}
