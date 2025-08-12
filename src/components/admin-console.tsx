
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Consultant, AttendanceRecord, SkillAnalysis, JobOpportunity } from '@/lib/types';
import type { JdMatcherOutput } from '@/ai/flows/jd-resume-matcher';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BarChart, Clock, ServerCrash, CalendarPlus, Download, Brain, ChevronDown, UserPlus, Edit, Briefcase, Target, MoreHorizontal, ThumbsUp, ThumbsDown, History, PieChartIcon, TrendingUp, Search, Sparkles, Loader2, Star, FileText, Trash2, FolderKanban, Users, UserCheck, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { createNewConsultant, markAttendance, updateTotalWorkingDays, updateConsultantStatus, createOrUpdateOpportunity, matchResumes, getJobOpportunities, deleteOpportunity } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Bar, ResponsiveContainer, XAxis, YAxis, BarChart as RechartsBarChart, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ResumeAnalyzer from './resume-analyzer';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


const createConsultantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('A valid email is required'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    department: z.enum(['Technology', 'Healthcare', 'Finance', 'Retail']),
});

const opportunitySchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    neededYOE: z.coerce.number().min(0, 'Years of experience must be a positive number'),
    neededSkills: z.string().min(1, 'At least one skill is required'),
    responsibilities: z.string().min(1, 'Responsibilities are required'),
});

const jdMatcherSchema = z.object({
    jobDescription: z.string().min(50, 'Job description must be at least 50 characters long.'),
});


type AdminConsoleProps = {
  consultants: Consultant[];
};

export default function AdminConsole({ consultants: initialConsultants }: AdminConsoleProps) {
  const [consultants, setConsultants] = useState(initialConsultants);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isCreateConsultantDialogOpen, setIsCreateConsultantDialogOpen] = useState(false);
  const [isOpportunityFormOpen, setIsOpportunityFormOpen] = useState(false);
  const [isManageOpportunitiesOpen, setIsManageOpportunitiesOpen] = useState(false);
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);
  const [isEditDaysDialogOpen, setIsEditDaysDialogOpen] = useState(false);
  const [isJdMatcherDialogOpen, setIsJdMatcherDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<JobOpportunity | null>(null);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent'>('Present');
  const [editableTotalDays, setEditableTotalDays] = useState(22);
  const [jdMatcherResult, setJdMatcherResult] = useState<JdMatcherOutput | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const consultantForm = useForm<z.infer<typeof createConsultantSchema>>({
    resolver: zodResolver(createConsultantSchema),
    defaultValues: {
        name: '',
        email: '',
        password: '',
        department: 'Technology',
    },
  });
  
  const opportunityForm = useForm<z.infer<typeof opportunitySchema>>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      id: '',
      title: '',
      neededYOE: 0,
      neededSkills: '',
      responsibilities: '',
    },
  });
  
  const jdMatcherForm = useForm<z.infer<typeof jdMatcherSchema>>({
    resolver: zodResolver(jdMatcherSchema),
    defaultValues: {
      jobDescription: '',
    },
  });

  useEffect(() => {
    setConsultants(initialConsultants);
  }, [initialConsultants]);

  const fetchOpportunities = useCallback(async () => {
    try {
        const fetchedOpportunities = await getJobOpportunities();
        setOpportunities(fetchedOpportunities);
    } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch opportunities.', variant: 'destructive'});
    }
  }, [toast]);

  useEffect(() => {
    if (isManageOpportunitiesOpen) {
        fetchOpportunities();
    }
  }, [isManageOpportunitiesOpen, fetchOpportunities]);

  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        consultant.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        consultant.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (Array.isArray(consultant.skills) && consultant.skills.some((skill: any) =>
          skill && typeof skill.skill === 'string' 
            ? skill.skill.toLowerCase().includes(lowerCaseSearchTerm)
            : false
        ));
      const matchesDept = departmentFilter === 'all' || consultant.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || consultant.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [consultants, searchTerm, departmentFilter, statusFilter]);

  const departments = ['all', 'Technology', 'Healthcare', 'Finance', 'Retail'];
  const statuses = ['all', 'On Bench', 'On Project'];

  const handleGenerateReport = () => {
    const total = filteredConsultants.length;
    const onBench = filteredConsultants.filter(c => c.status === 'On Bench').length;
    const onProject = filteredConsultants.filter(c => c.status === 'On Project').length;
    
    const reportText = `
      Consultant Report - ${new Date().toLocaleDateString()}
      ======================================================
      Total Consultants Matching Filter: ${total} (out of ${consultants.length} total)

      Status Breakdown:
      - On Bench: ${onBench}
      - On Project: ${onProject}

      Filtered Consultant List:
      ------------------------------------------------------
      ${filteredConsultants.map(c => `${c.name} (${c.email}) - ${c.status}`).join('\n')}
    `;
    
    setReportContent(reportText.trim());
    setIsReportDialogOpen(true);
  };

  const handleOpenAttendanceDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setSelectedDates([]);
    setIsAttendanceDialogOpen(true);
  };
  
 const handleSaveAttendance = async () => {
    if (selectedConsultant && selectedDates && selectedDates.length > 0) {
      let updatedConsultant: Consultant | undefined;
      for (const date of selectedDates) {
        updatedConsultant = await markAttendance(selectedConsultant.id, format(date, 'yyyy-MM-dd'), attendanceStatus);
      }
      
      if (updatedConsultant) {
        setConsultants(prev => 
            prev.map(c => c.id === updatedConsultant!.id ? updatedConsultant! : c)
        );
      }

      router.refresh();
      
      toast({
        title: 'Attendance Marked',
        description: `${selectedConsultant.name}'s attendance for ${selectedDates.length} day(s) marked as ${attendanceStatus}.`,
      });
      setIsAttendanceDialogOpen(false);
      setSelectedConsultant(null);
    } else {
        toast({
            title: 'No Dates Selected',
            description: 'Please select one or more dates to mark attendance.',
            variant: 'destructive',
        });
    }
  };

  const downloadAttendanceReport = (consultant: Consultant) => {
    let reportContent = `Attendance Report for ${consultant.name}\n`;
    reportContent += `Present: ${consultant.presentDays} / ${consultant.totalWorkingDays} days\n`;
    reportContent += '=====================================\n';
    reportContent += 'Date\t\tStatus\n';
    reportContent += '-------------------------------------\n';
    
    const sortedAttendance = [...consultant.attendance].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedAttendance.forEach(record => {
      reportContent += `${record.date}\t${record.status}\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${consultant.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAttendanceSummary = (consultant: Consultant) => {
    return `${consultant.presentDays}/${consultant.totalWorkingDays}`;
  };

  const onConsultantCreateSubmit = async (values: z.infer<typeof createConsultantSchema>) => {
    try {
        const newConsultant = await createNewConsultant(values);
        setConsultants(prev => [...prev, newConsultant]);
        router.refresh();
        toast({
            title: 'Consultant Created',
            description: `Successfully created ${values.name}.`,
        });
        setIsCreateConsultantDialogOpen(false);
        consultantForm.reset();
    } catch (error) {
         toast({
            title: 'Creation Failed',
            description: 'Could not create the new consultant.',
            variant: 'destructive',
        })
    }
  };
  
  const onOpportunitySubmit = async (values: z.infer<typeof opportunitySchema>) => {
    try {
        await createOrUpdateOpportunity(values);
        router.refresh();
        toast({
            title: values.id ? 'Opportunity Updated' : 'Opportunity Created',
            description: `Successfully saved the "${values.title}" role.`
        });
        setIsOpportunityFormOpen(false);
        fetchOpportunities(); // Refresh the list
    } catch (error) {
        toast({
            title: 'Save Failed',
            description: 'Could not save the opportunity.',
            variant: 'destructive',
        })
    }
  };

  const handleEditOpportunity = (opportunity: JobOpportunity) => {
    setSelectedOpportunity(opportunity);
    opportunityForm.reset({
        id: opportunity.id,
        title: opportunity.title,
        neededYOE: opportunity.neededYOE,
        neededSkills: opportunity.neededSkills.join(', '),
        responsibilities: opportunity.responsibilities,
    });
    setIsOpportunityFormOpen(true);
  };

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    opportunityForm.reset({
        id: '',
        title: '',
        neededYOE: 0,
        neededSkills: '',
        responsibilities: '',
    });
    setIsOpportunityFormOpen(true);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
        await deleteOpportunity(opportunityId);
        router.refresh();
        toast({
            title: "Opportunity Deleted",
            description: "The opportunity has been archived.",
        });
        fetchOpportunities();
    } catch (error) {
         toast({
            title: 'Deletion Failed',
            description: 'Could not delete the opportunity.',
            variant: 'destructive',
        })
    }
  }

  const calculateEfficiency = (consultant: Consultant) => {
    const skills = (consultant.skills as SkillAnalysis[]).filter(s => s && s.skill);
    const skillScore = skills.length > 0
        ? skills.reduce((acc, s) => acc + s.rating, 0) / skills.length
        : 0;

    const attendanceScore = consultant.totalWorkingDays > 0
        ? (consultant.presentDays / consultant.totalWorkingDays) * 100
        : 0;

    // Simplified opportunity score, assuming 2 accepted, 1 rejected, 1 waitlisted, 1 pending from the hardcoded UI
    const oppTotal = 5;
    const oppAccepted = 2;
    const oppWaitlisted = 1;
    const opportunityScore = oppTotal > 0 ? ((oppAccepted + oppWaitlisted * 0.5) / oppTotal) * 100 : 0;
    
    // Weighted average: Skills 50%, Attendance 30%, Opportunities 20%
    const weightedScore = (skillScore * 10 * 0.5) + (attendanceScore * 0.3) + (opportunityScore * 0.2);
    
    return Math.round(Math.min(weightedScore, 100)); // Cap at 100
  };

  const onJdMatcherSubmit = async (values: z.infer<typeof jdMatcherSchema>) => {
    setIsMatching(true);
    setJdMatcherResult(null);
    try {
        const onBenchConsultants = consultants.filter(c => c.status === 'On Bench' && hasSkillAnalysis(c));
        
        if (onBenchConsultants.length === 0) {
            toast({
                title: 'No Eligible Consultants',
                description: 'There are no consultants currently "On Bench" with an analyzed resume to match against.',
                variant: 'destructive'
            });
            setIsMatching(false);
            return;
        }

        const consultantProfiles = onBenchConsultants.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            skills: (c.skills as SkillAnalysis[]).map(s => ({ skill: s.skill, rating: s.rating })),
            efficiencyScore: calculateEfficiency(c),
        }));
        
        const result = await matchResumes({
            jobDescription: values.jobDescription,
            consultants: consultantProfiles,
        });
        
        setJdMatcherResult(result);

    } catch (error) {
        toast({
            title: 'Matching Failed',
            description: 'The AI engine could not process the request. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsMatching(false);
    }
  };
  

  const handleOpenAnalyzeDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setIsAnalyzeDialogOpen(true);
  };

  const handleOpenEditDaysDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setEditableTotalDays(consultant.totalWorkingDays);
    setIsEditDaysDialogOpen(true);
  };

  const handleSaveTotalDays = async () => {
    if (selectedConsultant) {
        const updatedConsultant = await updateTotalWorkingDays(selectedConsultant.id, editableTotalDays);
        if (updatedConsultant) {
            setConsultants(prev => 
                prev.map(c => c.id === updatedConsultant!.id ? updatedConsultant! : c)
            );
        }
        router.refresh();
        toast({
            title: 'Total Days Updated',
            description: `Total working days for ${selectedConsultant.name} set to ${editableTotalDays}.`,
        });
        setIsEditDaysDialogOpen(false);
        setSelectedConsultant(null);
    }
  };

  const handleAnalysisComplete = (updatedConsultant: Consultant) => {
    setConsultants(prev => prev.map(c => c.id === updatedConsultant.id ? updatedConsultant : c));
    router.refresh();
    setIsAnalyzeDialogOpen(false);
  };
  
  const hasSkillAnalysis = (consultant: Consultant) => {
    return Array.isArray(consultant.skills) && consultant.skills.length > 0 && consultant.skills.some(s => s && (s as SkillAnalysis).skill);
  };

  const handleRowToggle = (consultantId: string) => {
    if (hasSkillAnalysis(filteredConsultants.find(c => c.id === consultantId)!)) {
      setExpandedRow(prev => (prev === consultantId ? null : consultantId));
    }
  };

  const handleStatusChange = async (consultantId: string, status: 'On Bench' | 'On Project') => {
    const updatedConsultant = await updateConsultantStatus(consultantId, status);
    if (updatedConsultant) {
        setConsultants(prev => 
            prev.map(c => c.id === updatedConsultant!.id ? updatedConsultant! : c)
        );
    }
    router.refresh();
    toast({
        title: 'Status Updated',
        description: `Consultant status has been updated to ${status}.`
    });
  };

  const getAttendanceDataForPie = (consultant: Consultant) => {
    const present = consultant.presentDays;
    const total = consultant.totalWorkingDays;
    const absent = total - present;
    return [
        { name: 'Present', value: present, fill: 'hsl(var(--chart-2))' },
        { name: 'Absent', value: absent, fill: 'hsl(var(--destructive))' },
    ];
  };

  const generateEfficiencyData = (finalScore: number) => {
      const data = [];
      const points = 10;
      for (let i = 0; i < points; i++) {
          const randomFactor = (Math.random() - 0.4) * (finalScore / 10);
          const value = (finalScore / points) * (i + 1) + randomFactor;
          data.push({ name: `P${i}`, value: Math.max(0, Math.min(100, value)) });
      }
      data[points - 1].value = finalScore;
      return data;
  };

  const onBenchCount = useMemo(() => consultants.filter(c => c.status === 'On Bench').length, [consultants]);
  const onProjectCount = useMemo(() => consultants.filter(c => c.status === 'On Project').length, [consultants]);

  return (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{consultants.length}</div>
                <p className="text-xs text-muted-foreground">Total registered consultants</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Bench</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{onBenchCount}</div>
                <p className="text-xs text-muted-foreground">Consultants awaiting projects</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Project</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{onProjectCount}</div>
                <p className="text-xs text-muted-foreground">Consultants currently allocated</p>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Consultant Directory</CardTitle>
            <div className='flex flex-wrap gap-2'>
              <Dialog open={isCreateConsultantDialogOpen} onOpenChange={setIsCreateConsultantDialogOpen}>
                  <DialogTrigger asChild>
                       <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Consultant
                       </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Create New Consultant</DialogTitle>
                      </DialogHeader>
                      <Form {...consultantForm}>
                          <form onSubmit={consultantForm.handleSubmit(onConsultantCreateSubmit)} className="space-y-4">
                              <FormField
                                  control={consultantForm.control}
                                  name="name"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Name</FormLabel>
                                          <FormControl>
                                              <Input placeholder="John Doe" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={consultantForm.control}
                                  name="email"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={consultantForm.control}
                                  name="password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                              <Input placeholder="********" type="password" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                               <FormField
                                  control={consultantForm.control}
                                  name="department"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Department</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a department" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Technology">Technology</SelectItem>
                                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                                          <SelectItem value="Finance">Finance</SelectItem>
                                          <SelectItem value="Retail">Retail</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button type="submit">Create</Button>
                              </DialogFooter>
                          </form>
                      </Form>
                  </DialogContent>
              </Dialog>
              <Dialog open={isManageOpportunitiesOpen} onOpenChange={setIsManageOpportunitiesOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <FolderKanban className="mr-2 h-4 w-4" />
                    Manage Opportunities
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Manage Job Opportunities</DialogTitle>
                    <DialogDescription>
                      View, create, edit, or delete job opportunities.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end">
                    <Button onClick={handleCreateOpportunity}>
                      <Briefcase className="mr-2 h-4 w-4" /> Create New
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Experience (YOE)</TableHead>
                                <TableHead>Skills</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {opportunities.map(opp => (
                                <TableRow key={opp.id}>
                                    <TableCell className="font-medium">{opp.title}</TableCell>
                                    <TableCell>{opp.neededYOE}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {opp.neededSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditOpportunity(opp)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action will archive the opportunity. It will no longer be visible to candidates.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteOpportunity(opp.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleGenerateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Dialog open={isJdMatcherDialogOpen} onOpenChange={(isOpen) => { setIsJdMatcherDialogOpen(isOpen); if (!isOpen) { setJdMatcherResult(null); jdMatcherForm.reset(); }}}>
                <DialogTrigger asChild>
                    <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Find Best Talent
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Find Best Talent</DialogTitle>
                        <DialogDescription>
                            Paste a job description below. The AI will find the top 3 consultants from the bench.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...jdMatcherForm}>
                        <form onSubmit={jdMatcherForm.handleSubmit(onJdMatcherSubmit)} className="space-y-4">
                            <FormField
                                control={jdMatcherForm.control}
                                name="jobDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Paste the full job description here..." className="min-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isMatching}>
                                    {isMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Find Candidates
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                    {jdMatcherResult && (
                        <div className="mt-6">
                            <Separator />
                            <h3 className="text-lg font-semibold my-4">Top Candidates</h3>
                            <ScrollArea className="h-64">
                                {jdMatcherResult.topMatches.length > 0 ? (
                                    <div className="space-y-4 pr-4">
                                        {jdMatcherResult.topMatches.map((candidate) => (
                                            <Card key={candidate.consultantId}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{candidate.consultantName}</span>
                                                        <Badge>Score: {candidate.matchScore}</Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">{candidate.explanation}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <Sparkles className="h-4 w-4" />
                                        <AlertTitle>No Matches Found</AlertTitle>
                                        <AlertDescription>
                                            The AI could not find any suitable candidates for this job description.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Search by name, email, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status === 'all' ? 'All Statuses' : status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance (P/T)</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.length > 0 ? (
                  filteredConsultants.map((consultant) => (
                    <React.Fragment key={consultant.id}>
                      <TableRow
                        className={cn(hasSkillAnalysis(consultant) && 'cursor-pointer')}
                        onClick={() => handleRowToggle(consultant.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!hasSkillAnalysis(consultant)}
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                expandedRow === consultant.id && 'rotate-180'
                              )}
                            />
                            <span className="sr-only">Toggle details</span>
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{consultant.name}</TableCell>
                        <TableCell>{consultant.department}</TableCell>
                        <TableCell>
                          <Select
                            value={consultant.status}
                            onValueChange={(value: 'On Bench' | 'On Project') => {
                              handleStatusChange(consultant.id, value);
                            }}
                          >
                            <SelectTrigger className={cn("w-28", consultant.status === 'On Project' ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="On Bench">On Bench</SelectItem>
                                <SelectItem value="On Project">On Project</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getAttendanceSummary(consultant)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleOpenEditDaysDialog(consultant)}}>
                                <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              consultant.resumeStatus === 'Updated'
                                ? 'text-green-400 border-green-400'
                                : 'text-yellow-400 border-yellow-400'
                            }
                            variant="outline"
                          >
                            {consultant.resumeStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress
                                value={(consultant.opportunities / 5) * 100}
                                className="w-20"
                                indicatorClassName={cn({
                                    'bg-green-400': consultant.opportunities > 0,
                                })}
                                label={`${consultant.opportunities}`}
                                />
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">More actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Accept</DropdownMenuItem>
                                        <DropdownMenuItem>Decline</DropdownMenuItem>
                                        <DropdownMenuItem>Waitlist</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAnalyzeDialog(consultant);
                            }}
                          >
                            <Brain className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAttendanceDialog(consultant);
                            }}
                          >
                            <CalendarPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAttendanceReport(consultant);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRow === consultant.id && hasSkillAnalysis(consultant) && (
                         <TableRow>
                            <TableCell colSpan={8} className="p-0">
                                <div className="p-4 bg-muted/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-bold mb-2">Skill Proficiency</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                            <RechartsBarChart data={(consultant.skills as SkillAnalysis[]).filter(s => s && s.skill)}>
                                                <XAxis
                                                dataKey="skill"
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                />
                                                <YAxis
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 10]}
                                                />
                                                <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2 flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Attendance Summary</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={getAttendanceDataForPie(consultant)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                        if (percent === 0) return null;
                                                        return (
                                                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
                                                            {`${(percent * 100).toFixed(0)}%`}
                                                            </text>
                                                        );
                                                        }}>
                                                         {getAttendanceDataForPie(consultant).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'hsl(var(--background))',
                                                            border: '1px solid hsl(var(--border))',
                                                            borderRadius: 'var(--radius)'
                                                        }}
                                                    />
                                                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">Opportunity Engagement</h4>
                                        <div className="space-y-2 h-64 flex flex-col justify-center">
                                            <div className="relative h-6 w-full overflow-hidden rounded-full bg-secondary">
                                                <div className="absolute h-full bg-green-500" style={{ width: '40%' }}></div>
                                                <div className="absolute h-full bg-red-500" style={{ left: '40%', width: '20%' }}></div>
                                                <div className="absolute h-full bg-yellow-500" style={{ left: '60%', width: '15%' }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3 text-green-500" />
                                                    <span>Accepted (2)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ThumbsDown className="w-3 h-3 text-red-500" />
                                                    <span>Rejected (1)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <History className="w-3 h-3 text-yellow-500" />
                                                    <span>Waitlisted (1)</span>
                                                </div>
                                                 <span>Pending (1)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative bg-gradient-to-b from-blue-900/50 to-slate-900 p-4 rounded-lg overflow-hidden h-64 flex flex-col justify-center">
                                        <h4 className="font-bold mb-2 flex items-center gap-2 text-white z-10 relative">
                                            <TrendingUp className="w-4 h-4" />
                                            Consultant Efficiency
                                        </h4>
                                        <div className="absolute -bottom-8 -left-4 -right-4 h-40 z-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={generateEfficiencyData(calculateEfficiency(consultant))}>
                                                    <defs>
                                                        <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="hsl(180 100% 50%)" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="hsl(180 100% 50%)" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <Tooltip 
                                                        cursor={false}
                                                        contentStyle={{ display: 'none' }}
                                                    />
                                                    <Area type="monotone" dataKey="value" stroke="hsl(180 100% 50%)" strokeWidth={2} fill="url(#efficiencyGradient)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center mt-8 relative z-10">
                                            <p className="text-4xl font-bold text-cyan-300 drop-shadow-[0_2px_10px_rgba(0,255,255,0.5)]">{calculateEfficiency(consultant)}%</p>
                                            <p className="text-xs text-cyan-100/70">Overall Performance Score</p>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Mark Attendance for {selectedConsultant?.name}</DialogTitle>
                <DialogDescription>Select one or more dates and mark the attendance status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-1 items-center gap-4">
                    <Label htmlFor="date">Dates</Label>
                    <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        className="rounded-md border"
                    />
                    <p className="text-sm text-muted-foreground">
                        {selectedDates?.length || 0} date(s) selected.
                    </p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <RadioGroup 
                        defaultValue="Present"
                        className="col-span-3 flex items-center space-x-4"
                        value={attendanceStatus}
                        onValueChange={(value: 'Present' | 'Absent') => setAttendanceStatus(value)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Present" id="present"/>
                            <Label htmlFor="present">Present</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Absent" id="absent"/>
                            <Label htmlFor="absent">Absent</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveAttendance}>Save Attendance</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Analyze Resume for {selectedConsultant?.name}</DialogTitle>
            </DialogHeader>
            {selectedConsultant && (
                 <ResumeAnalyzer 
                    consultant={selectedConsultant} 
                    onAnalysisComplete={(result) => handleAnalysisComplete(result.consultant)} 
                 />
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDaysDialogOpen} onOpenChange={setIsEditDaysDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Total Working Days for {selectedConsultant?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="total-days-edit">Total Working Days</Label>
                <Input 
                    id="total-days-edit"
                    type="number"
                    value={editableTotalDays}
                    onChange={(e) => setEditableTotalDays(Number(e.target.value))}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveTotalDays}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultant Report</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <pre className="whitespace-pre-wrap text-sm">{reportContent}</pre>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpportunityFormOpen} onOpenChange={setIsOpportunityFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedOpportunity ? 'Edit' : 'Create'} Opportunity</DialogTitle>
                <DialogDescription>Fill in the details for the job role.</DialogDescription>
            </DialogHeader>
            <Form {...opportunityForm}>
                <form onSubmit={opportunityForm.handleSubmit(onOpportunitySubmit)} className="space-y-4">
                    <FormField
                        control={opportunityForm.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Senior React Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={opportunityForm.control}
                        name="neededYOE"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Years of Experience</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={opportunityForm.control}
                        name="neededSkills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Required Skills</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., React, TypeScript, Next.js" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Enter skills separated by commas.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={opportunityForm.control}
                        name="responsibilities"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Responsibilities</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Describe the job responsibilities..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Opportunity</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    

    