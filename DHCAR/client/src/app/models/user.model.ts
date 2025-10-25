export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
  phone?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
