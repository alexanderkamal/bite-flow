import { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { LoginUserDto, RegisterUserDto, RequestPasswordResetDto, ResetPasswordDto } from "../dto/auth.dto";
import { validateBody } from "../../../lib/validation/validate";
import { env } from "../../../lib/config/env";
import { setAccessTokenCookies, setAuthCookies } from "../../../lib/utils/cookies";
import {inject, injectable} from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate the request body against the RegisterUserDto
            const userData = await validateBody(RegisterUserDto, req.body);
            
            //call the register method of the authService 
            const result = await this.authService.register(userData);

            // set the access token and refresh token in the http-only cookies
           setAuthCookies(res, result.accessToken, result.refreshToken)

            // return the result with a 201 status code if no error occurs
            // res.status(201).json(result);
            sendSuccess(res, result, 201);
        } catch (error) {
            // pass the error to the next middleware (error handler)
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate the request body against the LoginUserDto
            const userData = await validateBody(LoginUserDto, req.body);

            //call the login method of the authService
            const result = await this.authService.login(userData);

            // set the access token and refresh token in the http-only cookies
            setAuthCookies(res, result.accessToken, result.refreshToken)

            // return the result with a 200 status code if no error occurs
            // res.status(200).json(result);
            sendSuccess(res, result);
        } catch (error) {
            // pass the error to the next middleware (error handler)
            next(error);
        }
    }

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate the request body against the RequestPasswordResetDto
            const requestData = await validateBody(RequestPasswordResetDto, req.body);

            // call the requestPasswordReset method of the authService
            const result = await this.authService.forgetPassword(requestData);

            // return the result with a 200 status code if no error occurs
            sendSuccess(res, result)
        } catch (error) {
            // pass the error to the next middleware (error handler)
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate the request body against the ResetPasswordDto
            const requestData = await validateBody(ResetPasswordDto, req.body);

            // call the resetPassword method of the authService
            const result = await this.authService.resetPassword(requestData);

            // return the result with a 200 status code if no error occurs
            res.status(200).json({
                "message": "Password reset successfully, please login again",
                result
            })
        } catch (error) {
            // pass the error to the next middleware (error handler)
            next(error);
        }
    }

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.authService.refresh(req.cookies.refresh_token)
            setAccessTokenCookies(res, result.accessToken)
            res.status(200).json("success, now you hace access with your current credits")

        } catch (error) {
            next(error)
        }
    }


    acceptInvite = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ResetPasswordDto, req.body);
            await this.authService.acceptInvite(data);
            res.status(200).json({
                "message": "Invitation accepted successfully, please login again",
            })
        }
        catch(err) {
            next(err);
        }
    }


}
