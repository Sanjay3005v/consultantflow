
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import type { SkillAnalysis } from '@/lib/types';
import { Separator } from './ui/separator';

type RecommendedTrainingProps = {
  skills: (string | SkillAnalysis)[];
};

const RECOMMENDED_TRAINING_THRESHOLD = 7;

export default function RecommendedTraining({ skills }: RecommendedTrainingProps) {
  const isSkillAnalysis = (skill: string | SkillAnalysis): skill is SkillAnalysis => {
    return typeof skill === 'object' && skill !== null && 'rating' in skill;
  };

  const lowRatedSkills = (skills || [])
    .filter(isSkillAnalysis)
    .filter(skill => skill.rating < RECOMMENDED_TRAINING_THRESHOLD)
    .sort((a, b) => a.rating - b.rating);

  if (lowRatedSkills.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          <span>Recommended Training</span>
        </CardTitle>
        <CardDescription>
          Based on your resume analysis, here are some suggested training areas to boost your skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {lowRatedSkills.map((skill, index) => (
            <li key={skill.skill}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{`Advanced ${skill.skill} Workshop`}</h4>
                  <p className="text-sm text-muted-foreground">Focus: Practical application and advanced concepts.</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        View <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
              </div>
              {index < lowRatedSkills.length - 1 && <Separator className="mt-4" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
