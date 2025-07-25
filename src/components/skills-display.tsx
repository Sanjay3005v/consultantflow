
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

type SkillsDisplayProps = {
  skills: string[];
};

export default function SkillsDisplay({ skills }: SkillsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          <span>Current Skills</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="default" className="text-lg py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No skills have been recorded yet. Analyze a resume to populate this section.</p>
        )}
      </CardContent>
    </Card>
  );
}
