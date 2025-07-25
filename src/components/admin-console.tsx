'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Consultant, AttendanceRecord } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BarChart, Clock, ServerCrash, CalendarPlus, Download } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { updateConsultantAttendance } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';


type AdminConsoleProps = {
  consultants: Consultant[];
};

export default function AdminConsole({ consultants: initialConsultants }: AdminConsoleProps) {
  const [consultants, setConsultants] = useState(initialConsultants);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent'>('Present');
  const { toast } = useToast();

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

  const departments = ['all', ...Array.from(new Set(consultants.map((c) => c.department)))];
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
    setIsAttendanceDialogOpen(true);
  };
  
  const handleSaveAttendance = () => {
    if (selectedConsultant && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const updatedConsultant = updateConsultantAttendance(selectedConsultant.id, formattedDate, attendanceStatus);
      
      setConsultants(prev => prev.map(c => c.id === selectedConsultant.id ? updatedConsultant! : c));

      toast({
        title: 'Attendance Marked',
        description: `${selectedConsultant.name}'s attendance for ${formattedDate} marked as ${attendanceStatus}.`,
      });
      setIsAttendanceDialogOpen(false);
      setSelectedConsultant(null);
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
                    <TableRow key={consultant.id}>
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
                        <Button variant="ghost" size="icon" onClick={() => handleOpenAttendanceDialog(consultant)}>
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadAttendanceReport(consultant)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
                <DialogDescription>Select a date and mark the attendance status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="col-span-3">
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus/>
                        </PopoverContent>
                    </Popover>
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
                <Button onClick={handleSaveAttendance}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
