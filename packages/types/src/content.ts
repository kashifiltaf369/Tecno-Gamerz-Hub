import type { ID, Timestamp } from './index';
import { z } from 'zod';

// User Content types
export interface UserContent {
  id: ID;
  userId: ID;
  title: string;
  videoUrl: string;
  createdAt: Timestamp;
  user: {
    id: ID;
    name: string;
    username?: string;
    image?: string;
  };
}

// Validation schemas
export const CreateUserContentSchema = z.object({
  title: z.string().min(3).max(100),
  videoUrl: z.string().url(),
});

export type CreateUserContentInput = z.infer<typeof CreateUserContentSchema>;