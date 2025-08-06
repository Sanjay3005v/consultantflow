
'use client';

import type { TrackResumeEvolutionOutput } from '@/ai/flows/resume-evolution-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowRight, TrendingUp } from 'lucide-react';

type ResumeEvolutionReportProps = {
    evolutionData: TrackResumeEvolutionOutput;
};

export default function ResumeEvolutionReport({ evolutionData }: ResumeEvolutionReportProps) {
    
    const getChangeBadge = (change: string) => {
        switch (change) {
        case 'Added': return <Badge variant="default" className="bg-green-600">Added</Badge>;
        case 'Improved': return <Badge variant="default" className="bg-blue-600">Improved</Badge>;
        case 'Decreased': return <Badge variant="destructive">Decreased</Badge>;
        case 'Removed': return <Badge variant="destructive">Removed</Badge>;
        default: return <Badge variant="secondary">Unchanged</Badge>;
        }
    };

    return (
        <Card className="bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span>Resume Evolution Report</span>
                </CardTitle>
                 <CardDescription>
                    Here's a comparison of your latest resume against the previous version.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-lg">Overall Score</h4>
                    <div className="flex items-center gap-4 mt-2 p-4 bg-muted/50 rounded-lg">
                        <div className='text-center'>
                            <p className='text-xs text-muted-foreground'>Old Score</p>
                            <p className='text-3xl font-bold'>{evolutionData.oldOverallScore.toFixed(1)}</p>
                        </div>
                        <ArrowRight className='h-6 w-6 text-muted-foreground' />
                        <div className='text-center'>
                            <p className='text-xs text-muted-foreground'>New Score</p>
                            <p className='text-3xl font-bold text-primary'>{evolutionData.newOverallScore.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-lg">Summary of Improvements</h4>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{evolutionData.summaryOfImprovements}</p>
                    </div>
                </div>
                
                {evolutionData.suggestions && (
                    <div>
                        <h4 className="font-semibold text-lg">Suggestions for Next Time</h4>
                        <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{evolutionData.suggestions}</p>
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="font-semibold text-lg">Skill Changes</h4>
                    <div className="mt-2 rounded-lg border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Skill</TableHead>
                                    <TableHead>Change</TableHead>
                                    <TableHead className="text-right">Rating</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evolutionData.skillChanges.map((change) => (
                                    <TableRow key={change.skill}>
                                        <TableCell className='font-medium'>{change.skill}</TableCell>
                                        <TableCell>{getChangeBadge(change.change)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                        {change.oldRating !== null && change.newRating !== null && change.oldRating !== change.newRating
                                            ? `${change.oldRating} → ${change.newRating}`
                                            : change.newRating ?? change.oldRating}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

