/**
 * Minimal single-owner admin session: one password (ADMIN_PASSWORD) and a signed, http-only
 * cookie that expires after 7 days. Only import this from inside server function handlers.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

import { loadLocalEnv } from "./env";

const COOKIE = "rv_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function password() {
  loadLocalEnv();
  return process.env["ADMIN_PASSWORD"] ?? "";
}

function secret() {
  loadLocalEnv();
  return process.env["ADMIN_SESSION_SECRET"] || createHash("sha256").update(`rv-admin:${password()}`).digest("hex");
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export class AuthError extends Error {
  constructor(message = "Please sign in again.") {
    super(message);
  }
}

export function isAdminConfigured() {
  return password().length >= 8;
}

export async function signIn(attempt: string) {
  if (!isAdminConfigured()) {
    throw new AuthError("Admin isn't set up yet. Add an ADMIN_PASSWORD (8+ characters) to the environment.");
  }
  if (!safeEqual(createHash("sha256").update(attempt).digest("hex"), createHash("sha256").update(password()).digest("hex"))) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // slow down guessing
    throw new AuthError("That password isn't right.");
  }
  const expires = String(Date.now() + MAX_AGE_SECONDS * 1000);
  setCookie(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function signOut() {
  deleteCookie(COOKIE, { path: "/" });
}

export function isSignedIn() {
  if (!isAdminConfigured()) return false;
  const value = getCookie(COOKIE);
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export function requireAdmin() {
  if (!isSignedIn()) throw new AuthError();
}
