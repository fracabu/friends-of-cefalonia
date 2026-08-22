import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { Role } from '@prisma/client'
import { db } from './db'

/**
 * Sessione con JWT firmato in un cookie httpOnly.
 *
 * Sta in una manciata di righe apposta: se domani servono Google o SPID, il
 * punto da cambiare è `createSession` — tutto il resto dell'app conosce solo
 * `getSession()` e `requireUser()`.
 */

const COOKIE = 'sessione'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 giorni

export type SessionPayload = {
  userId: string
  email: string
  role: Role
  agencyId: string | null
}

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value || value.length < 32) {
    throw new Error('AUTH_SECRET mancante o troppo corta: servono almeno 32 caratteri.')
  }
  return new TextEncoder().encode(value)
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/** L'utente completo dal database, o null. Usalo quando servono nome e agenzia. */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return db.user.findUnique({
    where: { id: session.userId },
    include: { agency: true },
  })
}

/** Da usare nelle pagine private: rimanda al login conservando la destinazione. */
export async function requireUser(returnTo = '/dashboard') {
  const session = await getSession()
  if (!session) redirect(`/accedi?redirect=${encodeURIComponent(returnTo)}`)
  return session
}

/** Da usare in dashboard: solo agenzie e amministratori pubblicano annunci. */
export async function requireAgent(returnTo = '/dashboard') {
  const session = await requireUser(returnTo)
  if (session.role !== 'AGENT' && session.role !== 'ADMIN') redirect('/dashboard?errore=permessi')
  return session
}

/** Vero se l'utente può modificare o cancellare quell'annuncio. */
export function canEditListing(
  session: SessionPayload | null,
  listing: { ownerId: string; agencyId: string | null },
) {
  if (!session) return false
  if (session.role === 'ADMIN') return true
  if (session.userId === listing.ownerId) return true
  return Boolean(session.agencyId && session.agencyId === listing.agencyId)
}
