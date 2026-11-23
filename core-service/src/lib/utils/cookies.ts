import type { Response } from "express";
import { env } from "../config/env";
import { toMs } from "../../pkg/utils/time";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string){
     res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: env.isProduction,
                maxAge: toMs(1, 'h') // 15 minutes
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: env.isProduction,
                maxAge: toMs(7, 'd'), // 7 days
                path: "/api/auth/refresh" // restrict the refresh token cookie to the refresh token endpoint
            });
}

export function setAccessTokenCookies(res: Response, accessToken: string){
     res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: env.isProduction,
                maxAge: toMs(1, 'h') // 15 minutes
            });
}