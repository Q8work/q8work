import type { Context } from "hono";

export interface EmailMessage {
  to: string;
  from: { email: string; name?: string };
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  // Cloudflare Email Sending binding (optional until the domain is onboarded)
  EMAIL?: { send: (message: EmailMessage) => Promise<unknown> };
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
