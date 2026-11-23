import { validate } from "class-validator";
import { AppError } from "../error/AppError";
import { plainToInstance } from "class-transformer";

export async function validateBody<T extends object>(dtoClass: new () => T, body: object | undefined): Promise<T> {
    const dtoInstance = plainToInstance(dtoClass, body ?? {});
    const errors = await validate(dtoInstance, { whitelist: true});
    if (errors.length > 0) {
        const errorMessages = errors.map(error => Object.values(error.constraints ?? {}).join(", ")).join("; ");
        throw new AppError(errorMessages, 400, true);
    }

    return dtoInstance;


}

// TODO: we should validate the query params as well, as they might be used in the service layer, 
// and we should make sure they are valid before passing them to the service layer.

// TODO: here, if we are passing nested objects in the body, they are validated but 
// they are not returned to the output so the error recieved in the response is not clear, 
// so we should make sure that the error message is clear and contains the nested object path as well.