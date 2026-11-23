import { NextFunction, Request, Response } from "express";
import { UserService } from "../service/user.service";
import { notAuthenticatedError, userNotFoundError } from "../error";
import { validateBody } from "../../../lib/validation/validate";
import { UpdateUserDTO } from "../dto/user.dto";
import { TOKENS } from "../../../lib/di/tokens";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserController {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {}

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get the userId from the request object (assuming it's set by an authentication middleware)
            const userId = req.user?.userId;

            if (!userId) {
                throw notAuthenticatedError; // or some other error indicating that the user is not authenticated
            }

            // call the getUserById method of the userService
            const user = await this.userService.getUserById(userId);

            // return the user data with a 200 status code if no error occurs
            res.status(200).json(user);

        } catch (error) {
            // pass the error to the next middleware (error handler)
            next(error);
        }    
    
    
    }

    updateMe = async(req: Request, res: Response, next: NextFunction) => {
        try{
            // get the userId from the request object (it's set by an authentication middleware) 
            const userId = req.user?.userId;

            if(!userId) {
                throw notAuthenticatedError;
            }

            // validate the request body against updateUserDTO
            const userData = await validateBody(UpdateUserDTO, req.body)



            // call the update user of userService
            const user = await this.userService.updateUser(userId, userData)

            res.status(200).json({message: "Profile updated", user});

        } catch (error){
            next(error);
        }
    }



}