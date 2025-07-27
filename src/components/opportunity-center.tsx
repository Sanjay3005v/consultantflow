
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Briefcase, Download, Sparkles } from 'lucide-react';
import type { Consultant, SkillAnalysis } from '@/lib/types';
import jsPDF from 'jspdf';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';

const jobOpportunities = [
    {
        id: 'fe-engineer',
        title: 'Senior Frontend Engineer',
        neededSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        neededYOE: 5,
        responsibilities: 'Lead the development of user-facing features, build reusable components, and optimize applications for maximum speed and scalability.',
    },
    {
        id: 'be-engineer',
        title: 'Backend Engineer',
        neededSkills: ['Node.js', 'Express', 'SQL', 'Docker', 'Go'],
        neededYOE: 4,
        responsibilities: 'Design and maintain server-side logic, define and maintain the central database, and ensure high performance and responsiveness to requests from the front-end.',
    },
    {
        id: 'cyber-analyst',
        title: 'Cybersecurity Analyst',
        neededSkills: ['Cybersecurity', 'SIEM', 'Firewalls', 'Penetration Testing'],
        neededYOE: 3,
        responsibilities: 'Monitor security alerts, conduct vulnerability assessments, and respond to security incidents to protect company assets.',
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        neededSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
        neededYOE: 4,
        responsibilities: 'Manage and improve the CI/CD pipeline, automate infrastructure provisioning, and ensure the reliability and scalability of our systems.',
    },
    {
        id: 'cloud-dev',
        title: 'Cloud Developer',
        neededSkills: ['AWS', 'GCP', 'Serverless', 'Microservices'],
        neededYOE: 3,
        responsibilities: 'Develop and deploy cloud-native applications, leverage serverless architecture, and manage cloud infrastructure.',
    },
    {
        id: 'ui-ux-designer',
        title: 'UI/UX Designer',
        neededSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        neededYOE: 3,
        responsibilities: 'Create user-centered designs by understanding business requirements, and user feedback. Design user flows, wireframes, prototypes, and mockups.',
    },
    {
        id: 'data-scientist',
        title: 'Data Scientist',
        neededSkills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'],
        neededYOE: 5,
        responsibilities: 'Analyze large, complex datasets to extract valuable insights, build predictive models, and support data-driven decision-making.',
    },
    {
        id: 'ml-engineer',
        title: 'Machine Learning Engineer',
        neededSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
        neededYOE: 4,
        responsibilities: 'Design, build, and deploy machine learning models. Manage the end-to-end ML lifecycle, including data pipelines and model deployment.',
    },
    {
        id: 'product-manager',
        title: 'Product Manager',
        neededSkills: ['Agile', 'Roadmapping', 'User Stories', 'Market Research'],
        neededYOE: 6,
        responsibilities: 'Define product vision, strategy, and roadmap. Work with cross-functional teams to plan, build, and launch products.',
    },
    {
        id: 'qa-engineer',
        title: 'QA Automation Engineer',
        neededSkills: ['Selenium', 'Cypress', 'JavaScript', 'CI/CD'],
        neededYOE: 3,
        responsibilities: 'Develop and maintain automated test scripts to ensure product quality. Integrate automated tests into the CI/CD pipeline.',
    },
    {
        id: 'full-stack-dev',
        title: 'Full Stack Developer',
        neededSkills: ['React', 'Node.js', 'SQL', 'REST APIs', 'TypeScript'],
        neededYOE: 3,
        responsibilities: 'Work on both the frontend and backend of our applications. Develop new features, fix bugs, and contribute to all phases of the development lifecycle.',
    },
    {
        id: 'mobile-dev',
        title: 'Mobile App Developer',
        neededSkills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
        neededYOE: 3,
        responsibilities: 'Develop and maintain our mobile applications for iOS and Android. Work with product and design teams to build new features.',
    },
    {
        id: 'solutions-arch',
        title: 'Solutions Architect',
        neededSkills: ['System Design', 'Microservices', 'AWS', 'GCP'],
        neededYOE: 8,
        responsibilities: 'Design and document complex software systems. Provide technical leadership to development teams and ensure solutions are scalable and secure.',
    },
    {
        id: 'it-pm',
        title: 'IT Project Manager',
        neededSkills: ['Agile', 'Scrum', 'JIRA', 'Budgeting'],
        neededYOE: 5,
        responsibilities: 'Plan, execute, and finalize IT projects according to strict deadlines and within budget. This includes acquiring resources and coordinating the efforts of team members.',
    },
    {
        id: 'dba',
        title: 'Database Administrator',
        neededSkills: ['SQL', 'PostgreSQL', 'Database Tuning', 'Backup & Recovery'],
        neededYOE: 4,
        responsibilities: 'Manage and maintain company databases. Ensure data integrity, performance, and security. Implement backup and recovery plans.',
    },
];

type OpportunityCenterProps = {
    consultant: Consultant;
}

export default function OpportunityCenter({ consultant }: OpportunityCenterProps) {
    const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

    const handleCheckboxChange = (opportunityId: string) => {
        setSelectedOpportunities(prev =>
            prev.includes(opportunityId)
                ? prev.filter(item => item !== opportunityId)
                : [...prev, opportunityId]
        );
    };

    const consultantSkills = useMemo(() => {
        if (Array.isArray(consultant.skills) && consultant.skills.length > 0 && typeof consultant.skills[0] !== 'string') {
            return (consultant.skills as SkillAnalysis[]).map(s => s.skill.toLowerCase());
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
    }, [consultantSkills]);


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
                    Review suggested job opportunities based on your skills and generate a PDF to track them.
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
