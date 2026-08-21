import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Error as MongooseError } from 'mongoose';
import User from '../models/user';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import {
  generateTokens,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyToken,
} from '../utils/auth';

const sendAuthResponse = (
  res: Response,
  user: { email: string; name: string },
  accessToken: string,
  refreshToken: string,
) => {
  setRefreshTokenCookie(res, refreshToken);
  return res.status(200).json({
    user: {
      email: user.email,
      name: user.name,
    },
    success: true,
    accessToken,
  });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверный email или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неверный email или пароль');
          }

          const { accessToken, refreshToken } = generateTokens(user._id.toString());

          return User.updateOne(
            { _id: user._id },
            { $push: { tokens: { token: refreshToken } } },
          ).then(() => sendAuthResponse(
            res,
            user,
            accessToken,
            refreshToken,
          ));
        });
    })
    .catch(next);
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  User.create({ name, email, password })
    .then((user) => {
      const { accessToken, refreshToken } = generateTokens(user._id.toString());

      return User.findByIdAndUpdate(
        user._id,
        { tokens: [{ token: refreshToken }] },
      ).then(() => sendAuthResponse(
        res,
        user,
        accessToken,
        refreshToken,
      ));
    })
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }

      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }

      return next(err);
    });
};

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.user?._id)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).json({
        user: {
          email: user.email,
          name: user.name,
        },
        success: true,
      });
    })
    .catch(next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = verifyToken(refreshToken);
  } catch {
    return next(new BadRequestError('Невалидный refresh-токен'));
  }

  return User.findById(payload._id).select('+tokens')
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => User.updateOne(
      { _id: user._id },
      { $pull: { tokens: { token: refreshToken } } },
    ))
    .then(() => {
      clearRefreshTokenCookie(res);
      return res.status(200).json({ success: true });
    })
    .catch(next);
};

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = verifyToken(refreshToken);
  } catch {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  return User.findById(payload._id).select('+tokens')
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      const tokenExists = user.tokens.some(({ token }) => token === refreshToken);

      if (!tokenExists) {
        throw new UnauthorizedError('Необходима авторизация');
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id.toString(),
      );

      const tokens = user.tokens
        .filter(({ token }) => token !== refreshToken)
        .concat([{ token: newRefreshToken }]);

      return User.updateOne(
        { _id: user._id },
        { $set: { tokens } },
      ).then(() => sendAuthResponse(
        res,
        user,
        accessToken,
        newRefreshToken,
      ));
    })
    .catch(next);
};
