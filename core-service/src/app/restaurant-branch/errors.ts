import { AppError } from "../../lib/error/AppError";

export const BranchNotFoundError = new AppError('Branch not found', 404);
export const NoArgumentsCanBeUpdatedError = new AppError("No Arguments passed that could be updated", 400, true);