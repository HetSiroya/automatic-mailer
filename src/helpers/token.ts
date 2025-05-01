import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

interface User {
    _id: string;
    email: string;
    name: string;
    mobileNumber: number;
}

function generateToken(user: User): string {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        mobileNumber: user.mobileNumber ,
    }
    let jwtSecret: string = process.env.JWT_SECRET_KEY || 'gfg_jwt_secret_key';
    const token: string = jwt.sign(payload, jwtSecret);
    return token;
}

export default generateToken;