'use client';

import { useState, useMemo } from 'react';
import type { Consultant } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BarChart, Clock, ServerCrash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

type AdminConsoleProps = {
  consultants: Consultant[];
};

export default function AdminConsole({ consultants }: AdminConsoleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      const matchesSearch =
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
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
                  <TableHead>Skills</TableHead>
                  <TableHead>Resume</TableHead>
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
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {consultant.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                          {consultant.skills.length > 3 && <Badge variant="outline">...</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge
                            className={consultant.resumeStatus === 'Updated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            variant="outline"
                          >
                          {consultant.resumeStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
