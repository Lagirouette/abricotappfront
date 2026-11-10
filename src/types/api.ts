
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
}

export type Role = "ADMIN" | "CONTRIBUTOR";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ProjectMember {
  id: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  members: ProjectMember[];
  userRole?: Role | null;
  _count?: { tasks: number };
}

export interface TaskAssignee {
  id: string;
  assignedAt: string;
  user: User;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: Pick<Project, "id" | "name">;
  creatorId: string;
  creator?: User;
  assignees: TaskAssignee[];
  comments: Comment[];
}

export interface AuthPayload {
  user: User;
  token: string;
}
