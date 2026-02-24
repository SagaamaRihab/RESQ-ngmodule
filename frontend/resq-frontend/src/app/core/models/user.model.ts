export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone?: string;
  course?: string;
  about?: string;
}
