
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Consultant, AttendanceRecord, SkillAnalysis } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BarChart, Clock, ServerCrash, CalendarPlus, Download, Brain, TrendingUp, ChevronDown, UserPlus } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { createNewConsultant, getFreshConsultants, markAttendance } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Bar, ResponsiveContainer, XAxis, YAxis, BarChart as RechartsBarChart } from 'recharts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ResumeAnalyzer from './resume-analyzer';
import { cn } from '@/lib/utils';


const createConsultantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('A valid email is required'),
    department: z.enum(['Technology', 'Healthcare', 'Finance', 'Retail']),
    status: z.enum(['On Bench', 'On Project']),
    training: z.enum(['Not Started', 'In Progress', 'Completed']),
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);
  
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent'>('Present');
  const { toast } = useToast();

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const form = useForm<z.infer<typeof createConsultantSchema>>({
    resolver: zodResolver(createConsultantSchema),
    defaultValues: {
        name: '',
        email: '',
        department: 'Technology',
        status: 'On Bench',
        training: 'Not Started',
    },
  });

  const refreshConsultants = async () => {
    const updatedConsultants = await getFreshConsultants();
    setConsultants(updatedConsultants);
  };

  useEffect(() => {
    setConsultants(initialConsultants);
  }, [initialConsultants]);

  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      const matchesSearch =
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(consultant.skills) && consultant.skills.some((skill: any) =>
          typeof skill === 'string' 
            ? skill.toLowerCase().includes(searchTerm.toLowerCase())
            : skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesDept = departmentFilter === 'all' || consultant.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || consultant.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [consultants, searchTerm, departmentFilter, statusFilter]);

  const departments = ['all', 'Technology', 'Healthcare', 'Finance', 'Retail'];
  const statuses = ['all', 'On Bench', 'On Project'];

  const generateReport = () => {
    const total = filteredConsultants.length;
    const onBench = filteredConsultants.filter(c => c.status === 'On Bench').length;
    const onProject = filteredConsultants.filter(c => c.status === 'On Project').length;
    return `
      Showing ${total} of ${consultants.length} consultants.
      - On Bench: ${onBench}
      - On Project: ${onProject}
    `;
  };

  const handleOpenAttendanceDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setSelectedDates([]);
    setIsAttendanceDialogOpen(true);
  };
  
  const handleSaveAttendance = async () => {
    if (selectedConsultant && selectedDates && selectedDates.length > 0) {
      for (const date of selectedDates) {
        await markAttendance(selectedConsultant.id, format(date, 'yyyy-MM-dd'), attendanceStatus);
      }

      await refreshConsultants();
      
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

  const getAttendanceSummary = (attendance: AttendanceRecord[]) => {
    const present = attendance.filter(a => a.status === 'Present').length;
    const total = attendance.length;
    return `${present}/${total}`;
  };

  const onCreateSubmit = async (values: z.infer<typeof createConsultantSchema>) => {
    await createNewConsultant(values);
    await refreshConsultants();
    toast({
        title: 'Consultant Created',
        description: `Successfully created ${values.name}.`,
    });
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleOpenAnalyzeDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setIsAnalyzeDialogOpen(true);
  };

  const handleAnalysisComplete = (skills: SkillAnalysis[]) => {
    refreshConsultants();
    setIsAnalyzeDialogOpen(false);
  };
  
  const hasSkillAnalysis = (consultant: Consultant) => {
    return Array.isArray(consultant.skills) && consultant.skills.length > 0 && typeof consultant.skills[0] !== 'string';
  };

  const handleRowToggle = (consultantId: string) => {
    setExpandedRow(prev => (prev === consultantId ? null : consultantId));
  };


  return (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Queue</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">145</div>
                <p className="text-xs text-muted-foreground">Resumes pending analysis</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">32s</div>
                <p className="text-xs text-muted-foreground">For skill vector generation</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <ServerCrash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1.2%</div>
                <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Consultant Directory</CardTitle>
            <div className='flex gap-2'>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                      <Form {...form}>
                          <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                              <FormField
                                  control={form.control}
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
                                  control={form.control}
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
                                  control={form.control}
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
                                <FormField
                                  control={form.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Status</FormLabel>
                                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="On Bench">On Bench</SelectItem>
                                          <SelectItem value="On Project">On Project</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                               <FormField
                                  control={form.control}
                                  name="training"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Training</FormLabel>
                                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select training status" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Not Started">Not Started</SelectItem>
                                          <SelectItem value="In Progress">In Progress</SelectItem>
                                           <SelectItem value="Completed">Completed</SelectItem>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Generate Report</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Consultant Status Report</DialogTitle>
                    <DialogDescription>
                      A summary of the currently filtered consultants.
                    </DialogDescription>
                  </DialogHeader>
                  <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
                      <code className="text-white">{generateReport()}</code>
                  </pre>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Search by name or skill..."
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
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultants.length > 0 ? (
                  filteredConsultants.map((consultant) => (
                    <Collapsible asChild key={consultant.id} open={expandedRow === consultant.id} onOpenChange={() => handleRowToggle(consultant.id)}>
                      <>
                        <TableRow>
                          <TableCell>
                             <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={!hasSkillAnalysis(consultant)}>
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRow === consultant.id && "rotate-180")} />
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                             </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">{consultant.name}</TableCell>
                          <TableCell>{consultant.department}</TableCell>
                          <TableCell>
                            <Badge variant={consultant.status === 'On Project' ? 'default' : 'secondary'}>
                              {consultant.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getAttendanceSummary(consultant.attendance)}
                          </TableCell>
                          <TableCell>
                            <Badge
                                className={consultant.resumeStatus === 'Updated' ? 'text-green-400 border-green-400' : 'text-yellow-400 border-yellow-400'}
                                variant="outline"
                              >
                              {consultant.resumeStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                             <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleOpenAnalyzeDialog(consultant)}}>
                               <Brain className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleOpenAttendanceDialog(consultant)}}>
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); downloadAttendanceReport(consultant)}}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {hasSkillAnalysis(consultant) && (
                           <TableRow>
                            <TableCell colSpan={7} className="p-0">
                                <CollapsibleContent>
                                    <div className="p-4 bg-muted/50 rounded-md m-1 border">
                                        <h4 className="font-bold mb-2">Skill Proficiency</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsBarChart data={consultant.skills as SkillAnalysis[]}>
                                                    <XAxis dataKey="skill" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                                                    <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                             </TableCell>
                           </TableRow>
                        )}
                      </>
                    </Collapsible>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                 <ResumeAnalyzer consultant={selectedConsultant} onAnalysisComplete={handleAnalysisComplete} />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
