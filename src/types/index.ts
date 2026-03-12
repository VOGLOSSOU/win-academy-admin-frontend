// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  communeId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ApiCategory {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  ageMin: number;
  ageMax: number;
  createdAt: string;
  formations?: ApiFormation[];
}

// ─── Formation ────────────────────────────────────────────────────────────────
export type FormationLevel = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';

export interface ApiFormation {
  id: string;
  title: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  level?: FormationLevel;
  duration?: number;
  image?: string | null;
  categoryId?: string;
  createdAt: string;
  category?: ApiCategory;
  modules?: ApiModule[];
  evaluation?: ApiEvaluation | null;
  _count?: { enrollments: number };
}

// ─── Module ───────────────────────────────────────────────────────────────────
export interface ApiModule {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  formationId: string;
  createdAt: string;
  contents?: ApiContent[];
  formation?: ApiFormation;
}

// ─── Content ──────────────────────────────────────────────────────────────────
export type ContentType = 'VIDEO' | 'PDF' | 'TEXT' | 'IMAGE';

export interface ApiContent {
  id: string;
  type: ContentType;
  title: string;
  url?: string | null;
  body?: string | null;
  order: number;
  moduleId: string;
  createdAt: string;
  module?: ApiModule;
}

// ─── Evaluation ───────────────────────────────────────────────────────────────
export interface ApiEvaluation {
  id: string;
  formationId: string;
  passingScore: number;
  maxAttempts?: number | null;
  timeLimit?: number | null;
  formation?: ApiFormation;
  questions?: ApiQuestion[];
}

// ─── Question & Answer ────────────────────────────────────────────────────────
export interface ApiAnswer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface ApiQuestion {
  id: string;
  evaluationId: string;
  questionText: string;
  createdAt: string;
  answers?: ApiAnswer[];
  evaluation?: ApiEvaluation;
}

// ─── Legacy types (pages non encore branchées) ───────────────────────────────
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Commune {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CERTIFIED' | 'DROPPED';

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  formationId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  user?: User;
  formationId: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
}
