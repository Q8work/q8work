import type { Context } from "hono";

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
}

export interface UserRow {
  id: string;
  email: string;
  role: "worker" | "company" | "admin";
  status: "active" | "suspended";
  created_at: number;
}

export type Variables = {
  user: UserRow;
};

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
