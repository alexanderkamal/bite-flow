import bcrypt from "bcrypt";
import { env } from "../../lib/config/env";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

export interface JWTPayload {
    userId: number;
    email: string;
    systemRole: string;
    // for restaurant users only
    restaurantId?: number;
    restaurantRole?: string;
    branchIds?: number[];
}

export function createAccessToken(payLoad: JWTPayload): string {
    const secretKey = env.jwt.ACCESS_TOKEN_SECRET;
    const expiresIn = env.jwt.ACCESS_TOKEN_EXPIRES_IN;
    const options: jwt.SignOptions = {
        expiresIn: expiresIn,
    };
    const token = jwt.sign(payLoad, secretKey, options);
    return token;
}

export function createRefreshToken(payLoad: JWTPayload): string {
    const secretKey = env.jwt.REFRESH_TOKEN_SECRET;
    const expiresIn = env.jwt.REFRESH_TOKEN_EXPIRES_IN;
    const options: jwt.SignOptions = {
        expiresIn: expiresIn, // Type assertion to StringValue
    };
    const token = jwt.sign(payLoad, secretKey, options);
    return token;
}

export function verifyAccessToken(token: string): JWTPayload {
    const secretKey = env.jwt.ACCESS_TOKEN_SECRET;
    const payload = jwt.verify(token, secretKey) as JWTPayload;
    return payload;
}

export function verifyRefreshToken(token: string): JWTPayload {
    const secretKey = env.jwt.REFRESH_TOKEN_SECRET;
    const payload = jwt.verify(token, secretKey) as JWTPayload;
    return payload;
}

export function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateOTP(): string {
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
}

export function hashOTP(otp: string): string {
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    return hashedOTP;
}
