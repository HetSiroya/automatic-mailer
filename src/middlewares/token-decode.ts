import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
require('dotenv').config()
import dotenv from 'dotenv';
import User from '../models/userModel';

export const SECRET_KEY: Secret = process.env.JWT_SECRET_KEY || 'gfg_jwt_secret_key';

export interface TokenPayload extends JwtPayload {
  _id: string;  
  email: string;
}

export interface CustomRequest extends Request {
  user?: TokenPayload;
}

export const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token missing');
    }
    const verifytoken = await User.findOne({ token });
    if (!verifytoken) {
      throw new Error('Invalid token');
    }

    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    if (!decoded) {
      throw new Error('Invalid token');
    }
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).send('Please authenticate');
  }
};