import { AppError } from "../../lib/error/AppError";

export const userNotFoundError = new AppError("User not found", 404, true);
export const notAuthenticatedError = new AppError("Not Authenticated User", 403, true);   
export const NoArgumentsCanBeUpdatedError = new AppError("No Arguments passed that could be updated", 400, true)
export const phoneAlreadyInUseError = new AppError("Phone number is already in use", 409, true)
