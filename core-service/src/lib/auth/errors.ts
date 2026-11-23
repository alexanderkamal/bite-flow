import { AppError } from "../error/AppError";

export const notAuthenticatedError = new AppError("Not Authenticated User", 401, true);   
export const UnAuthorisedError = new AppError('User not authorised', 403);
export const restaurantUnAuthorisedError = new AppError('User not authorised for this restaurant', 403);
export const branchUnAuthorisedError = new AppError('User not authorised for this branch', 403);