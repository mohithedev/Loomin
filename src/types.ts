export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  position: number;
  description: string;
}

export interface Course {
  id: string;
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  videos: Video[];
  createdAt: number;
  updatedAt: number;
  userId?: string;
  isPublic: boolean;
}

export interface UserProgress {
  courseId: string;
  completedVideoIds: string[];
  lastWatchedVideoId: string;
  lastUpdated: number;
}

export type ThemeMode = 'light' | 'dark' | 'midnight';

export type PlanType = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  createdAt: number;
  passwordHash?: string;
}
