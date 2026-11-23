import { AppError } from "../../lib/error/AppError";

export const restaurantNotFoundError = new AppError("Restaurant not found", 404, true);
export const NoArgumentsCanBeUpdatedError = new AppError("No Arguments passed that could be updated", 400, true);
