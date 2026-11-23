import { Knex } from "knex";
import { CreateRestaurantOwnerDTO, UpdateUserDTO } from "../dto/user.dto";
import { NoArgumentsCanBeUpdatedError, userNotFoundError } from "../error";
import { createUser, findUserByEmail, findUserById, findUserExistsByEmail, findUserExistsByEmailOrPhone, findUserExistsById, updateUser } from "../repository/user.repo";
import { User } from "../entity/user.entity";
import { userAlreadyExistsError } from "../../auth/errors";
import { hashPassword } from "../../auth/utils";
import { SystemRole } from "../enums";
import { injectable } from "tsyringe";

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    systemRole: SystemRole;
}

@injectable()
export class UserService {

    create = async (userData: CreateUserData, trx?: Knex) => {
        const existingUser = await findUserExistsByEmailOrPhone(userData.email, userData.phone);
        if (existingUser) {
            throw userAlreadyExistsError;
        }
        const hashedPassword = userData.password ? await hashPassword(userData.password) : ''; // empty string stays empty for invited members who set password later

        const now = new Date();
        const user = await createUser({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            passwordHash: hashedPassword,
            systemRole: userData.systemRole,
            createdAt: now,
            updatedAt: now,
        }, trx);
        return user;
    }


    getUserById = async (userId: number) => {
        // find the user by id
        const user = await findUserById(userId);

        // if not found, throw an error
        if (!user) {
            throw userNotFoundError;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            systemRole: user.systemRole,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
    }

    findUserExistByEmail = async (email: string) => {
        const exist = await findUserExistsByEmail(email);
        return exist;
    }

    updateUser = async (userId: number, userData: UpdateUserDTO) => {
        // find user by id
        const exists = await findUserExistsById(userId)

        // if not found throw error
        if(!exists){
            throw userNotFoundError
        }

        // if no phone or name passed, return that there is no argument could be updated
        if(!userData.name && !userData.phone){
            throw NoArgumentsCanBeUpdatedError
        }
        

        // update user and show the new data to user
        const updatedUser = await updateUser(userId, userData)
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            systemRole: updatedUser.systemRole,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        }
    }

    // createRestaurantOwnerByAdmin = async (userData: CreateRestaurantOwnerDTO, trx: Knex) => {

    //     const existingUser = await findUserExistsByEmailOrPhone(userData.email, userData.phone);
    //     if (existingUser) {
    //                 throw userAlreadyExistsError;
    //             }
    //     const hashedPassword = await hashPassword(userData.password);
        
    //     const now = new Date();
    //     const user = await createUser({
    //         name: userData.name,
    //         email: userData.email,
    //         phone: userData.phone,
    //         passwordHash: hashedPassword,
    //         systemRole: SystemRole.RESTAURANT_USER,
    //         createdAt: now,
    //         updatedAt: now,
    //     }, trx)
    //     return user;
    // }

}