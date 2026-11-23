import { AppError } from "../../lib/error/AppError";

export const productNotFoundError = new AppError('Poduct not found', 404);
export const NoArgumentsCanBeUpdatedError = new AppError("No Arguments passed that could be updated", 400, true);
export const branchIdPassesButNoBranchFieldsPassedError = new AppError("No Arguments for branch passed that could be updated", 400, true);
export const BranchFieldsPassedButNoBranchIdPassedError = new AppError("Arguments for branch passed But No branchId Passed", 400, true);
export const BranchNotRelatedToRestaurantError = new AppError("The passed Branch doesn't belong to the passed product's restaurant", 400, true)