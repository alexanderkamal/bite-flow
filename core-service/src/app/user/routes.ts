import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { UserController } from "./controller/user.controller";

export const userRoutes = Router()

const userController = container.resolve<UserController>(TOKENS.UserController);


userRoutes.get("/me", authenticate, userController.getMe); // protect route with authGuard
userRoutes.patch("/me", authenticate, userController.updateMe);
