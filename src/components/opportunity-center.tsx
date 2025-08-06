
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Briefcase, Download, Sparkles, Loader2, ThumbsUp, ThumbsDown, History } from 'lucide-react';
import type { Consultant, SkillAnalysis } from '@/lib/types';
import type { ProjectAllocationOutput } from '@/ai/flows/project-allocation-agent';
import jsPDF from 'jspdf';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { getProjectAllocations } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';

type OpportunityCenterProps = {
    consultant: Consultant;
    onAllocationComplete: (opportunityCount: number) => void;
}

type AllocatedProject = ProjectAllocationOutput['allocatedProjects'][0];
type OpportunityStatus = 'Accepted' | 'Declined' | 'Waitlisted' | 'Pending';

export default function OpportunityCenter({ consultant, onAllocationComplete }: OpportunityCenterProps) {
    const [loading, setLoading] = useState(false);
    const [allocationResult, setAllocationResult] = useState<ProjectAllocationOutput | null>(null);
    const [opportunityStatuses, setOpportunityStatuses] = useState<Record<string, OpportunityStatus>>({});
    const { toast } = useToast();

    const consultantSkills = useMemo(() => {
        if (Array.isArray(consultant.skills) && consultant.skills.length > 0) {
            return (consultant.skills as SkillAnalysis[]).filter(s => s && s.skill);
        }
        return [];
    }, [consultant.skills]);

    async function handleGetAllocations() {
        if (consultantSkills.length === 0) {
            toast({
                title: 'Skills Not Found',
                description: 'Please analyze your resume first to get project allocations.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setAllocationResult(null);
        setOpportunityStatuses({});
        try {
            const result = await getProjectAllocations({
                consultantName: consultant.name,
                consultantSkills: consultantSkills,
            });
            setAllocationResult(result);
            onAllocationComplete(result.allocatedProjects.length);
            
            // Initialize all projects as 'Pending'
            const initialStatuses: Record<string, OpportunityStatus> = {};
            result.allocatedProjects.forEach(p => {
                initialStatuses[p.projectName] = 'Pending';
            });
            setOpportunityStatuses(initialStatuses);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Allocation Failed',
                description: 'Something went wrong while contacting the Project Allocation Agent.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    const setStatus = (projectName: string, status: OpportunityStatus) => {
        setOpportunityStatuses(prev => ({ ...prev, [projectName]: status }));
    };

    const getStatusVariant = (status: OpportunityStatus) => {
        switch (status) {
            case 'Accepted': return 'default';
            case 'Declined': return 'destructive';
            case 'Waitlisted': return 'secondary';
            default: return 'outline';
        }
    };
    
    const getStatusIcon = (status: OpportunityStatus) => {
        switch (status) {
            case 'Accepted': return <ThumbsUp className="w-4 h-4" />;
            case 'Declined': return <ThumbsDown className="w-4 h-4" />;
            case 'Waitlisted': return <History className="w-4 h-4" />;
            default: return null;
        }
    };

    const generatePdf = () => {
        if (!allocationResult) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Project Opportunities for ${consultant.name}`, 14, 22);
        
        let yPos = 35;

        allocationResult.allocatedProjects.forEach(proj => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`${proj.projectName} (Fit: ${proj.fitRating}/10)`, 14, yPos);
            yPos += 7;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            const status = opportunityStatuses[proj.projectName] || 'Pending';
            doc.text(`Status: ${status}`, 14, yPos);
            yPos += 7;

            doc.setFont(undefined, 'bold');
            doc.text('Domain:', 14, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(proj.domain, 40, yPos);
            yPos += 7;

            doc.setFont(undefined, 'bold');
            doc.text('Required Skills:', 14, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(proj.requiredSkills.join(', '), 40, yPos);
            yPos += 7;

            doc.setFont(undefined, 'bold');
            doc.text('Justification:', 14, yPos);
            yPos += 5;
            const splitJustification = doc.splitTextToSize(proj.justification, 180);
            doc.setFont(undefined, 'normal');
            doc.text(splitJustification, 14, yPos);
            yPos += (splitJustification.length * 5) + 10;
        });

        doc.save(`project_allocations_${consultant.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <Card className="bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <span>Project Allocation Agent</span>
                </CardTitle>
                <CardDescription>
                    Let our AI agent find the best project opportunities based on your skills.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                     <Button 
                        onClick={handleGetAllocations} 
                        disabled={loading}
                        className="w-full"
                    >
                         {loading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finding Projects...
                            </>
                        ) : (
                            <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Find Projects
                            </>
                        )}
                    </Button>

                    {allocationResult && (
                        <>
                        <ScrollArea className="h-96 w-full rounded-md border border-border/50 p-4">
                            <div className="space-y-4">
                                {allocationResult.allocatedProjects.map(proj => (
                                    <Card key={proj.projectName} className="bg-card/80">
                                        <CardHeader>
                                            <CardTitle className='flex items-center justify-between'>
                                                <span>{proj.projectName}</span>
                                                <Badge variant={getStatusVariant(opportunityStatuses[proj.projectName])} className="flex items-center gap-1">
                                                    {getStatusIcon(opportunityStatuses[proj.projectName])}
                                                    {opportunityStatuses[proj.projectName]}
                                                </Badge>
                                            </CardTitle>
                                             <CardDescription>
                                                 <Badge variant="secondary">{proj.domain}</Badge>
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-sm">
                                            <div className="flex items-center gap-4">
                                                    <span className="font-semibold">Fit Rating:</span>
                                                    <Progress value={proj.fitRating * 10} className="w-32" />
                                                    <span>{proj.fitRating}/10</span>
                                            </div>
                                            <p><span className="font-semibold">Required Skills:</span> {proj.requiredSkills.join(', ')}</p>
                                            <p className="text-muted-foreground"><span className="font-semibold text-foreground">Justification:</span> {proj.justification}</p>
                                        </CardContent>
                                        <CardFooter className="flex gap-2 justify-end pt-2">
                                                <Button size="sm" variant="outline" onClick={() => setStatus(proj.projectName, 'Waitlisted')}>
                                                    <History className="mr-1 h-4 w-4" /> Waitlist
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setStatus(proj.projectName, 'Declined')}>
                                                    <ThumbsDown className="mr-1 h-4 w-4" /> Decline
                                                </Button>
                                                <Button size="sm" onClick={() => setStatus(proj.projectName, 'Accepted')}>
                                                     <ThumbsUp className="mr-1 h-4 w-4" /> Accept
                                                </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                        
                        <Alert className="bg-background/80">
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI Feedback</AlertTitle>
                            <AlertDescription className="mt-2 whitespace-pre-wrap">
                                {allocationResult.feedbackSummary}
                            </AlertDescription>
                        </Alert>
                        
                         <Button 
                            onClick={generatePdf} 
                            disabled={!allocationResult}
                            variant="outline"
                            className="w-full bg-transparent"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Projects as PDF
                        </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
