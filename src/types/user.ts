import { Id } from "../../convex/_generated/dataModel";

export type UserRole = "ADMIN" | "EMPLOYEE";

export interface User {
  _id: Id<"users">;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: number;
  _creationTime: number;
}
