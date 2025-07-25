
'use client';

import { getConsultantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { User, FileText, CalendarCheck, Target, Award } from 'lucide-react';
import StatusCard from '@/components/status-card';
import WorkflowTracker from '@/components/workflow-tracker';
import ResumeAnalyzer from '@/components/resume-analyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Consultant, SkillAnalysis } from '@/lib/types';
import { useState } from 'react';
import SkillsDisplay from '@/components/skills-display';

export default function ConsultantPage({ params }: { params: { id: string } }) {
  const consultant = getConsultantById(params.id);
  const [skills, setSkills] = useState(consultant?.skills || []);
  const [workflow, setWorkflow] = useState(consultant?.workflow);

  if (!consultant) {
    notFound();
  }

  const handleSkillsUpdate = (newSkills: SkillAnalysis[]) => {
    setSkills(newSkills);
    if(workflow){
        const updatedWorkflow = {
            ...workflow,
            resumeUpdated: true,
        };
        setWorkflow(updatedWorkflow);
    }
  };

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
          value={workflow?.resumeUpdated ? 'Updated' : 'Pending'}
          icon={FileText}
          variant={workflow?.resumeUpdated ? 'success' : 'warning'}
        />
        <StatusCard
          title="Attendance"
          value={`${consultant.attendance.completed} / ${consultant.attendance.completed + consultant.attendance.missed} Meetings`}
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
                    {workflow && <WorkflowTracker workflow={workflow} />}
                </CardContent>
            </Card>
            <SkillsDisplay skills={skills} />
        </div>
        
        <ResumeAnalyzer consultant={consultant} onAnalysisComplete={handleSkillsUpdate} />
      </div>
    </div>
  );
}
