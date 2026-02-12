// User Types
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  departmentId?: string;
  communeId?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Commune Types
export interface Commune {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Formation Types
export interface FormationModule {
  id: string;
  formationId: string;
  title: string;
  description?: string;
  order: number;
  contents: FormationContent[];
}

export interface FormationContent {
  id: string;
  moduleId: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'FILE';
  content: string;
  duration?: number;
  order: number;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: Category;
  instructorId: string;
  instructor?: User;
  price: number;
  duration: number;
  maxStudents: number;
  isPublished: boolean;
  modules: FormationModule[];
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Evaluation Types
export interface Question {
  id: string;
  evaluationId: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TEXT';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
}

export interface Evaluation {
  id: string;
  formationId: string;
  formation?: Formation;
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Types
export type EnrollmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CERTIFIED' | 'DROPPED';

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  formationId: string;
  formation?: Formation;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  certificateId?: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  user?: User;
  formationId: string;
  formation?: Formation;
  certificateNumber: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
}

// Dashboard KPI Types
export interface DashboardKPIs {
  totalUsers: number;
  totalFormations: number;
  totalEnrollments: number;
  totalCertificates: number;
  usersByRole: Record<UserRole, number>;
  enrollmentsByMonth: { month: string; count: number }[];
  formationsByCategory: { category: string; count: number }[];
}
