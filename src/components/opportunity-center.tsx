
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Briefcase, Download } from 'lucide-react';
import type { Consultant } from '@/lib/types';
import jsPDF from 'jspdf';
import { ScrollArea } from './ui/scroll-area';

const jobOpportunities = [
    'Senior Frontend Engineer',
    'Backend Engineer',
    'Cybersecurity Analyst',
    'DevOps Engineer',
    'Cloud Developer',
    'UI/UX Designer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Product Manager',
    'QA Automation Engineer',
    'Full Stack Developer',
    'Mobile App Developer',
    'Solutions Architect',
    'IT Project Manager',
    'Database Administrator',
];

type OpportunityCenterProps = {
    consultant: Consultant;
}

export default function OpportunityCenter({ consultant }: OpportunityCenterProps) {
    const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

    const handleCheckboxChange = (opportunity: string) => {
        setSelectedOpportunities(prev => 
            prev.includes(opportunity)
                ? prev.filter(item => item !== opportunity)
                : [...prev, opportunity]
        );
    };

    const generatePdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(`Opportunities for ${consultant.name}`, 10, 20);
        
        doc.setFontSize(12);
        let yPos = 30;
        selectedOpportunities.forEach((opp, index) => {
            if (yPos > 280) { // Add new page if content overflows
                doc.addPage();
                yPos = 20;
            }
            doc.text(`${index + 1}. ${opp}`, 15, yPos);
            yPos += 10;
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
                    Select relevant job opportunities and generate a PDF to track them.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <div className="space-y-2">
                        {jobOpportunities.map(opp => (
                            <div key={opp} className="flex items-center space-x-2">
                                <Checkbox
                                    id={opp}
                                    onCheckedChange={() => handleCheckboxChange(opp)}
                                    checked={selectedOpportunities.includes(opp)}
                                />
                                <Label htmlFor={opp} className="font-normal cursor-pointer">
                                    {opp}
                                </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <Button 
                        onClick={generatePdf} 
                        disabled={selectedOpportunities.length === 0}
                        className="w-full"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Generate Opportunity PDF ({selectedOpportunities.length})
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
