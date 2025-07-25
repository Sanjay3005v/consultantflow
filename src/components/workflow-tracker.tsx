'use client';

import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

type WorkflowTrackerProps = {
  workflow: {
    resumeUpdated: boolean;
    attendanceReported: boolean;
    opportunitiesDocumented: boolean;
    trainingCompleted: boolean;
  };
};

const steps = [
  { id: 'resumeUpdated', label: 'Resume Updated' },
  { id: 'attendanceReported', label: 'Attendance Reported' },
  { id: 'opportunitiesDocumented', label: 'Opportunities Documented' },
  { id: 'trainingCompleted', label: 'Training Completed' },
];

export default function WorkflowTracker({ workflow }: WorkflowTrackerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completedSteps = Object.values(workflow).filter(Boolean).length;
    const totalSteps = Object.keys(workflow).length;
    setProgress((completedSteps / totalSteps) * 100);
  }, [workflow]);

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} className="w-full" />
        <p className="text-right text-sm text-muted-foreground mt-2">{Math.round(progress)}% Complete</p>
      </div>
      <ul className="space-y-4">
        {steps.map((step) => {
          const isCompleted = workflow[step.id as keyof typeof workflow];
          return (
            <li key={step.id} className="flex items-center space-x-3">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
              <span className={`text-lg ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
