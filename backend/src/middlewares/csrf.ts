import { Request, Response, NextFunction } from 'express';
import { randomBytes, timingSafeEqual } from 'crypto';

const CSRF_COOKIE = 'csrfToken';
const CSRF_HEADER = 'x-csrf-token';

type CsrfReq = Request & { csrfToken?: string; csrfJustIssued?: boolean };

export const csrfProtection = (req: CsrfReq, res: Response, next: NextFunction) => {
  const cookieToken = (req as any).cookies?.[CSRF_COOKIE] as string | undefined;

  if (!cookieToken) {
    const token = randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });
    req.csrfToken = token;
    req.csrfJustIssued = true;
  } else {
    req.csrfToken = cookieToken;
    req.csrfJustIssued = false;
  }

  next();
};

// ✅ Проверяем CSRF ТОЛЬКО на перечисленных путях (опт-ин)
const PROTECTED = [
  /^\/auth\/logout\/?$/i,
  /^\/auth\/token\/?$/i,
  /^\/upload(\/|$)/i,
];

export const verifyCsrf = (req: CsrfReq, res: Response, next: NextFunction) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const url = (req.originalUrl || req.url || req.path || '').toLowerCase();

  // если путь НЕ в списке защищённых — пропускаем без проверки
  const needsCsrf = PROTECTED.some((rx) => rx.test(url))
    // на случай если nginx срезал `/api`
    || PROTECTED.some((rx) => rx.test(url.replace(/^\/api/, '')));

  if (!needsCsrf) return next();

  if (req.csrfJustIssued) return next();

  const cookieToken = req.csrfToken;
  const headerToken = (req.headers[CSRF_HEADER] as string | undefined) || '';

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'Неверный CSRF токен' });
  }

  if (cookieToken.length !== headerToken.length) {
    return res.status(403).json({ message: 'Неверный CSRF токен' });
  }

  const cookieBuffer = new Uint8Array(Buffer.from(cookieToken, 'utf8'));
  const headerBuffer = new Uint8Array(Buffer.from(headerToken, 'utf8'));
  const ok = timingSafeEqual(cookieBuffer, headerBuffer);

  if (!ok) {
    return res.status(403).json({ message: 'Неверный CSRF токен' });
  }

  return next();
};
