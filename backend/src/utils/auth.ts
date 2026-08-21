import { Response } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_JWT_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
} from '../config';

interface TokenPayload {
  _id: string;
}

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { _id: userId },
    AUTH_JWT_SECRET,
    { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    AUTH_JWT_SECRET,
    { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY },
  );

  return { accessToken, refreshToken };
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
    path: '/',
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 0,
    path: '/',
  });
};

export const verifyToken = (token: string): TokenPayload => jwt.verify(
  token,
  AUTH_JWT_SECRET,
) as TokenPayload;
