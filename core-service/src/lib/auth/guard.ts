import { NextFunction, Request, Response } from "express";
import { notAuthenticatedError } from "./errors";
import { verifyAccessToken } from "../../app/auth/utils";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    
    // check if the access token is present in the cookies
    const token = req.cookies.access_token;
    if (!token) {
        throw notAuthenticatedError;
    }

    // verify the token and extract the user information
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        throw notAuthenticatedError;
    }
}