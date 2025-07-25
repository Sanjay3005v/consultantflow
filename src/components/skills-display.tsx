
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import type { SkillAnalysis } from '@/lib/types';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from './ui/table';
import { Progress } from './ui/progress';

type SkillsDisplayProps = {
  skills: string[] | SkillAnalysis[];
};

export default function SkillsDisplay({ skills }: SkillsDisplayProps) {
    const isSkillAnalysis = (skill: string | SkillAnalysis): skill is SkillAnalysis => {
        return typeof skill === 'object' && 'rating' in skill;
    }
  
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
            isSkillAnalysis(skills[0]) ? (
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Skill</TableHead>
                        <TableHead className="w-1/3">Proficiency</TableHead>
                        <TableHead>Reasoning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(skills as SkillAnalysis[]).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.skill}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={item.rating * 10} className="w-20" />
                              <span className="text-muted-foreground">{item.rating}/10</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.reasoning}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {(skills as string[]).map((skill, index) => (
                    <Badge key={index} variant="default" className="text-lg py-1 px-3">
                        {skill}
                    </Badge>
                    ))}
                </div>
            )
        ) : (
          <p className="text-muted-foreground">No skills have been recorded yet. Analyze a resume to populate this section.</p>
        )}
      </CardContent>
    </Card>
  );
}
