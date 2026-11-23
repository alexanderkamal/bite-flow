import { AppError } from "../../lib/error/AppError";

export const notAuthenticatedError = new AppError("Not Authenticated User", 403, true);
export const AddressNotFoundError = new AppError("Address Not Found!", 403, true);