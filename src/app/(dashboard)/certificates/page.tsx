'use client';

import { useState } from 'react';
import { Search, Eye, Download, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

interface Certificate {
  id: string;
  userName: string;
  userEmail: string;
  formationTitle: string;
  certificateNumber: string;
  issuedAt: string;
  verificationCode: string;
}

const mockCertificates: Certificate[] = [
  { id: '1', userName: 'John Doe', userEmail: 'john@email.com', formationTitle: 'Web Development', certificateNumber: 'WA-2024-001', issuedAt: '2024-01-20', verificationCode: 'ABC123' },
  { id: '2', userName: 'Jane Smith', userEmail: 'jane@email.com', formationTitle: 'UI/UX Design', certificateNumber: 'WA-2024-002', issuedAt: '2024-02-25', verificationCode: 'DEF456' },
  { id: '3', userName: 'Mike Wilson', userEmail: 'mike@email.com', formationTitle: 'Digital Marketing', certificateNumber: 'WA-2024-003', issuedAt: '2024-03-15', verificationCode: 'GHI789' },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCertificates = certificates.filter((cert) =>
    cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (cert: Certificate) => {
    toast.success(`Downloading certificate ${cert.certificateNumber}`);
  };

  const handleVerify = (code: string) => {
    toast.success(`Certificate verified: ${code}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Manage and issue certificates</p>
        </div>
        <Button>
          <FileCheck className="mr-2 h-4 w-4" /> Issue Certificate
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search certificates..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cert.userName}</div>
                      <div className="text-sm text-muted-foreground">{cert.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{cert.formationTitle}</TableCell>
                  <TableCell>{cert.issuedAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.verificationCode}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Certificate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(cert)}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerify(cert.verificationCode)}>
                          Verify
                        </DropdownMenuItem>
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
