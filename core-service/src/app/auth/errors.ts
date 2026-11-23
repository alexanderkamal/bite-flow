import e from "express";
import { AppError } from "../../lib/error/AppError";

export const userAlreadyExistsError = new AppError("User already exists", 400, true);
export const cannotSignUpAsSystemAdminError = new AppError("Cannot sign up as system admin", 403, true);
export const invalidCredentialsError = new AppError("Invalid email or password", 401, true);
export const invalidOTPError = new AppError("Invalid OTP or OTP has expired", 401, true);
export const RestaurantDataIsRequiredError = new AppError("Restaurant Data is required", 400, true)