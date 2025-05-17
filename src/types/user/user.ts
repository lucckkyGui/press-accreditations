
export type UserRole = 'admin' | 'organizer' | 'staff' | 'guest';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}
