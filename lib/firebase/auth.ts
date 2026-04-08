"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/** Persist the Firebase ID token as a plain cookie for middleware. */
async function persistSession(credential: UserCredential) {
  const token = await credential.user.getIdToken();
  // 7 day expiry
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; expires=${expires}; SameSite=Lax`;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await persistSession(credential);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(credential.user, { displayName });
  await persistSession(credential);
  return credential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  await persistSession(credential);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { SESSION_COOKIE };
