export type Role = 'user' | 'admin';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; name: string; email: string; role: Role } | string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string; email: string; role: Role } | string;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}
