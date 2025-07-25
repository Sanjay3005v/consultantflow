import { getConsultantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { User, FileText, CalendarCheck, Target, Award } from 'lucide-react';
import StatusCard from '@/components/status-card';
import WorkflowTracker from '@/components/workflow-tracker';
import ResumeAnalyzer from '@/components/resume-analyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ConsultantPage({ params }: { params: { id: string } }) {
  const consultant = getConsultantById(params.id);

  if (!consultant) {
    notFound();
  }

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
          value={consultant.resumeStatus}
          icon={FileText}
          variant={consultant.resumeStatus === 'Updated' ? 'success' : 'warning'}
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
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <WorkflowTracker workflow={consultant.workflow} />
            </CardContent>
        </Card>
        
        <ResumeAnalyzer consultant={consultant} />
      </div>
    </div>
  );
}
