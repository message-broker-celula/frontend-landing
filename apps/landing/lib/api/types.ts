/** Shared API contracts expected from the cell backend. */

export type AuthProvider = "google" | "github";

export type DatabaseStatus =
  | "provisioning"
  | "active"
  | "paused"
  | "deleted"
  | "error";

export interface PublicMetrics {
  totalUsers: number;
  totalDatabases: number;
  activeDatabases: number;
  totalLogins: number;
  activeUsers: number;
  /** Service availability as a percentage (0–100). */
  availability: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider: AuthProvider;
  createdAt: string;
}

export interface DatabaseStorage {
  usedBytes: number;
  maxBytes: number;
}

export interface UserDatabase {
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  engine: string;
  status: DatabaseStatus;
  createdAt: string;
  lastActivityAt: string | null;
  storage: DatabaseStorage;
}

export interface ProvisioningStatus {
  status: DatabaseStatus;
  message?: string | null;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
}
