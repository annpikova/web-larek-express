import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { config } from '../config';
import BadRequestError from '../errors/BadRequestError';
import UnauthorizedError from '../errors/UnauthorizedError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || 'Ё-мое',
      email,
      password: hashedPassword,
      tokens: [],
    });

    const accessToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '10m' },
    );

    const refreshToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // Сохраняем refresh токен в базе
    user.tokens.push({ token: refreshToken });
    await user.save();

    // Устанавливаем httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/',
    });

    res.status(HTTP_STATUS.CREATED).json({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS));
      return;
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      next(new BadRequestError(ERROR_MESSAGES.VALIDATION_ERROR));
      return;
    }
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      next(new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS));
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      next(new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS));
      return;
    }

    const accessToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '10m' },
    );

    const refreshToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // Сохраняем refresh токен в базе
    user.tokens.push({ token: refreshToken });
    await user.save();

    // Устанавливаем httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    next(new UnauthorizedError('Refresh токен не найден'));
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, config.JWT_SECRET) as { _id: string };
    const user = await User.findById(payload._id).select('+tokens');

    if (!user || !user.tokens.some((tokenObj) => tokenObj.token === refreshToken)) {
      next(new UnauthorizedError('Неверный refresh токен'));
      return;
    }

    const newAccessToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '10m' },
    );

    const newRefreshToken = jwt.sign(
      { _id: user._id.toString() },
      config.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // Удаляем старый refresh токен и добавляем новый
    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();

    // Устанавливаем новый httpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(new UnauthorizedError('Неверный refresh токен'));
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    next(new BadRequestError('Refresh токен не найден'));
    return;
  }

  try {
    const payload = jwt.verify(refreshToken, config.JWT_SECRET) as { _id: string };
    const user = await User.findById(payload._id);

    if (!user) {
      next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
      return;
    }

    // Удаляем refresh токен из базы
    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
    await user.save();

    // Очищаем cookie
    res.clearCookie('refreshToken');

    res.status(HTTP_STATUS.OK).json({
      success: true,
    });
  } catch (error) {
    next(new BadRequestError('Неверный refresh токен'));
  }
};

const getCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  const { _id } = req.user!;

  try {
    const user = await User.findById(_id);

    if (!user) {
      next(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND));
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      user: {
        email: user.email,
        name: user.name,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export {
  register, login, refreshAccessToken, logout, getCurrentUser,
};
