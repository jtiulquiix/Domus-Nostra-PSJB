export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  imageUrl: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string; // Denormalized for easier display
  userId: string;
  userName: string; // Denormalized
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationHours: number;
  purpose: string;
  status: BookingStatus;
  createdAt: number;
}

export interface AppConfig {
  appName: string;
  appLogo: string; // Can be a URL (starts with http) or a FontAwesome class (e.g., 'fa-church')
}