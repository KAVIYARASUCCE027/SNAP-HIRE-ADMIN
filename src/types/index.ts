export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  github?: string;
  resume?: string;
  university: string;
  year: string;
  gpa?: number;
  matchScore: number;
  status: 'pending' | 'contacted' | 'interviewed' | 'accepted' | 'rejected';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  duration: string;
  type: 'remote' | 'onsite' | 'hybrid';
  startDate: string;
  status: 'active' | 'closed' | 'draft';
  applicants: Student[];
  createdAt: string;
  testFiles?: File[];
}

export interface Application {
  id: string;
  studentId: string;
  projectId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
}