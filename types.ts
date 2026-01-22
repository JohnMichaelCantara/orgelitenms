
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  bio?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: string[]; // User IDs
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  type: 'PHOTO' | 'DOCUMENT';
  isPublic: boolean;
}

export interface UserRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'EVENT_JOIN' | 'FILE_DOWNLOAD';
  targetId: string; // Event ID or Gallery Item ID
  status: RequestStatus;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  timestamp: string;
  // Added LOGIN and REGISTER to match the application's internal Page type union.
  targetPage?: 'HOME' | 'GALLERY' | 'ANNOUNCEMENTS' | 'NOTIFICATIONS' | 'MESSAGES' | 'ADMIN' | 'PROFILE' | 'LOGIN' | 'REGISTER';
  targetId?: string;
}
