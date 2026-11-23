import { Router } from "express";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { AuthController } from "./controller/auth.controller";
import { idempotency } from "../../lib/idempotency/idempotency";

export const authRoutes = Router();

const authController = container.resolve<AuthController>(TOKENS.AuthController);

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/forget-password", idempotency({strict: true}), authController.forgetPassword); // Endpoint for requesting password reset   
authRoutes.post("/reset-password", authController.resetPassword); // Endpoint for resetting the password
authRoutes.get("/refresh", authController.refresh)
authRoutes.post('/accept-invite', authController.acceptInvite);