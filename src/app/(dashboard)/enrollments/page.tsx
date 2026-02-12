'use client';

import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrollmentStatus } from '@/types';
import { toast } from 'sonner';

interface Enrollment {
  id: string;
  userName: string;
  userEmail: string;
  formationTitle: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
}

const mockEnrollments: Enrollment[] = [
  { id: '1', userName: 'John Doe', userEmail: 'john@email.com', formationTitle: 'Web Development', status: 'IN_PROGRESS', progress: 65, enrolledAt: '2024-01-15' },
  { id: '2', userName: 'Jane Smith', userEmail: 'jane@email.com', formationTitle: 'UI/UX Design', status: 'COMPLETED', progress: 100, enrolledAt: '2024-02-20' },
  { id: '3', userName: 'Mike Wilson', userEmail: 'mike@email.com', formationTitle: 'Digital Marketing', status: 'PENDING', progress: 0, enrolledAt: '2024-03-10' },
  { id: '4', userName: 'Sarah Brown', userEmail: 'sarah@email.com', formationTitle: 'Web Development', status: 'CERTIFIED', progress: 100, enrolledAt: '2024-04-05' },
];

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.formationTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CERTIFIED':
        return 'bg-purple-100 text-purple-800';
      case 'DROPPED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) => e.id === id ? { ...e, status: 'IN_PROGRESS' as EnrollmentStatus } : e)
    );
    toast.success('Enrollment approved');
  };

  const handleReject = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) => e.id === id ? { ...e, status: 'DROPPED' as EnrollmentStatus } : e)
    );
    toast.success('Enrollment rejected');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollments</h1>
        <p className="text-muted-foreground">Manage student enrollments</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search enrollments..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CERTIFIED">Certified</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{enrollment.userName}</div>
                      <div className="text-sm text-muted-foreground">{enrollment.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.formationTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <span className="text-sm">{enrollment.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(enrollment.status)}>
                      {enrollment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{enrollment.enrolledAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {enrollment.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(enrollment.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(enrollment.id)} className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
