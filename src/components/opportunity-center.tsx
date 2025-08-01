
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Briefcase, Download, Sparkles, Loader2 } from 'lucide-react';
import type { Consultant, SkillAnalysis, JobOpportunity } from '@/lib/types';
import jsPDF from 'jspdf';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { getOpportunityFeedback, updateSelectedOpportunities } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { format } from 'date-fns';

type OpportunityCenterProps = {
    consultant: Consultant;
    opportunities: JobOpportunity[];
}

export default function OpportunityCenter({ consultant, opportunities: jobOpportunities }: OpportunityCenterProps) {
    const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(consultant.selectedOpportunities || []);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setSelectedOpportunities(consultant.selectedOpportunities || []);
    }, [consultant.selectedOpportunities]);

    const handleCheckboxChange = async (opportunityId: string) => {
        const newSelection = selectedOpportunities.includes(opportunityId)
                ? selectedOpportunities.filter(item => item !== opportunityId)
                : [...selectedOpportunities, opportunityId];
        
        setSelectedOpportunities(newSelection);
        await updateSelectedOpportunities(consultant.id, newSelection);
    };

    const consultantSkills = useMemo(() => {
        if (Array.isArray(consultant.skills) && consultant.skills.length > 0) {
            return (consultant.skills as SkillAnalysis[])
                .filter(s => s && s.skill)
                .map(s => s.skill.toLowerCase());
        }
        return [];
    }, [consultant.skills]);

    const suggestedOpportunities = useMemo(() => {
        if (consultantSkills.length === 0) return [];
        
        return jobOpportunities.filter(opp => {
            const matchedSkills = opp.neededSkills.filter(neededSkill => 
                consultantSkills.includes(neededSkill.toLowerCase())
            ).length;
            // Suggest if at least 50% of required skills are matched
            return (matchedSkills / opp.neededSkills.length) >= 0.5;
        }).map(opp => opp.id);
    }, [consultantSkills, jobOpportunities]);

    const getOpportunityStacks = () => {
       const stacks = new Set<string>();
       jobOpportunities.forEach(opp => {
           opp.neededSkills.forEach(skill => stacks.add(skill));
       });
       return Array.from(stacks);
    }

    async function handleGetFeedback() {
        setLoading(true);
        setFeedback(null);
        try {
            const result = await getOpportunityFeedback({
                consultantName: consultant.name,
                month: format(new Date(), 'MMMM'),
                opportunitiesProvided: consultant.opportunities,
                // These are placeholder values. In a real app, this would come from tracking consultant actions.
                acceptedCount: Math.floor(Math.random() * (consultant.opportunities + 1)),
                rejectedCount: Math.floor(Math.random() * (consultant.opportunities + 1)),
                noResponseCount: Math.floor(Math.random() * (consultant.opportunities + 1)),
                consultantSkills: consultantSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)), // Capitalize for readability
                opportunityStacks: getOpportunityStacks(),
            });
            setFeedback(result.engagementSummary);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Feedback Generation Failed',
                description: 'Something went wrong while contacting the AI agent. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }


    const generatePdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Selected Opportunities for ${consultant.name}`, 14, 22);
        
        let yPos = 35;

        jobOpportunities
            .filter(opp => selectedOpportunities.includes(opp.id))
            .forEach(opp => {
                if (yPos > 260) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(opp.title, 14, yPos);
                yPos += 7;
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`Required Experience: ${opp.neededYOE}+ years`, 14, yPos);
                yPos += 7;

                doc.setFont(undefined, 'bold');
                doc.text('Needed Skills:', 14, yPos);
                doc.setFont(undefined, 'normal');
                doc.text(opp.neededSkills.join(', '), 40, yPos);
                yPos += 7;

                doc.setFont(undefined, 'bold');
                doc.text('Responsibilities:', 14, yPos);
                yPos += 5;
                const splitResponsibilities = doc.splitTextToSize(opp.responsibilities, 180);
                doc.setFont(undefined, 'normal');
                doc.text(splitResponsibilities, 14, yPos);
                yPos += (splitResponsibilities.length * 5) + 10;
            });


        doc.save(`opportunities_${consultant.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <span>Opportunity Center</span>
                </CardTitle>
                <CardDescription>
                    Review job opportunities, get AI feedback on your engagement, and generate a PDF to track them.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <ScrollArea className="h-96 w-full rounded-md border">
                        <Accordion type="multiple" className="p-2">
                            {jobOpportunities.map(opp => (
                                <AccordionItem value={opp.id} key={opp.id}>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={opp.id}
                                            onCheckedChange={() => handleCheckboxChange(opp.id)}
                                            checked={selectedOpportunities.includes(opp.id)}
                                            className="mt-4 ml-2"
                                        />
                                        <AccordionTrigger className='flex-1'>
                                            <div className="flex items-center gap-4 text-left">
                                                <span>{opp.title}</span>
                                                {suggestedOpportunities.includes(opp.id) && (
                                                    <Badge variant="secondary" className="border-green-400 text-green-400">
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        Suggested
                                                    </Badge>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                    </div>
                                    <AccordionContent className="pl-12 pr-4 pb-4">
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-semibold">Years of Experience:</span> {opp.neededYOE}+</p>
                                            <p><span className="font-semibold">Skills:</span> {opp.neededSkills.join(', ')}</p>
                                            <p className="text-muted-foreground">{opp.responsibilities}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                    <div className="grid grid-cols-2 gap-4">
                         <Button 
                            onClick={handleGetFeedback} 
                            disabled={loading}
                        >
                             {loading ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                                </>
                            ) : (
                                <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Get Engagement Feedback
                                </>
                            )}
                        </Button>
                        <Button 
                            onClick={generatePdf} 
                            disabled={selectedOpportunities.length === 0}
                            variant="outline"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Generate PDF ({selectedOpportunities.length})
                        </Button>
                    </div>

                    {feedback && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI Engagement Summary</AlertTitle>
                            <AlertDescription className="mt-2 whitespace-pre-wrap">
                            {feedback}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
