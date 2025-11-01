import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// Простая CSRF-защита без csurf
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Генерируем токен при первом запросе
  let token = req.cookies.csrfToken;

  if (!token) {
    token = randomBytes(32).toString('hex');
    res.cookie('csrfToken', token, {
      httpOnly: false, // Должен быть доступен для JS
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 час
    });
    req.cookies.csrfToken = token;
  }

  req.csrfToken = () => token;
  return next();
};

// Проверка CSRF токена для unsafe методов
export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
  const isUnsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isPublic = ['/auth/login', '/auth/register'].includes(req.path);

  if (!isUnsafe || isPublic) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies.csrfToken;

  if (!headerToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: 'Неверный CSRF токен' });
  }

  return next();
};
