import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findAllRestaurants, findRestaurantById, updateRestaurantById, updateRestaurantStatus } from "../repository/restaurant.repo";
import { NoArgumentsCanBeUpdatedError, restaurantNotFoundError } from "../errors";
import { SystemRole } from "../../user/enums";
import { CreateRestaurantWithOwnerByAdminDTO, UpdateRestaurantByIdDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { db } from "../../../lib/knex/knex";
import { UserService } from "../../user/service/user.service";
import { MemberService } from "../../rbac/service/member.service";
import { TOKENS } from "../../../lib/di/tokens";
import { inject, injectable } from "tsyringe";
import { buildCursorPaginationResponse, CursorPaginationParams, FilterParams } from "../../../lib/http/pagination/cursor-pagination";


@injectable()
export class RestaurantService {

    constructor(
        @inject(TOKENS.UserService) private readonly userService: UserService, 
        @inject(TOKENS.MemberService) private readonly memberService: MemberService){}

    createRestaurant = async (userId: number, restaurantData: RegisterRestaurantDTO, trx: Knex) => {
        const now = new Date();
        const newRestaurant = new Restaurant({
            ownerId: userId,
            name: restaurantData.name,
            logoURL: restaurantData.logoURL,
            status: RestaurantStatus.PENDING,
            primaryCountry: restaurantData.primaryCountry,
            createdAt: now,
            updatedAt: now,
            statusUpdatedAt: now

        })
        const restaurant = await createRestaurant(newRestaurant, trx);
        return restaurant;
    }

    createRestaurantWithOwnerByAdmin = async (userRole: SystemRole, data: CreateRestaurantWithOwnerByAdminDTO) => {
        if (userRole != SystemRole.SYSTEM_ADMIN){
            throw UnAuthorisedError;
        }
        const now = new Date();
        const trx = await db.transaction();
        
        try {
            // const user = await this.userService.createRestaurantOwnerByAdmin(data.owner, trx);
            const user = await this.userService.create({
                name: data.owner.name,
                email: data.owner.email,
                phone: data.owner.phone,
                password: data.owner.password,
                systemRole: SystemRole.RESTAURANT_USER
            }, trx);

            const restaurant = await createRestaurant({
             ownerId: user.id,
             name: data.name,
             logoURL: data.logoURL,
             primaryCountry: data.primaryCountry,
             status: RestaurantStatus.ACTIVE,
             createdAt: now,
             updatedAt: now,
             statusUpdatedAt: now,
            }, trx);

            const member = await this.memberService.createOwnerMember(restaurant.id, user.id, trx);

            await trx.commit();
            
            return{
                restaurant,
                owner: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    SystemRole: user.systemRole
                },
                member
            };

        } catch (error){
            await trx.rollback();
            throw error;
        }

    }

    findRestaurantById = async (id: number) => {
        const restaurant = await findRestaurantById(id);
        if(!restaurant){
            throw restaurantNotFoundError;
        }
        return restaurant;
    }

    findAllRestaurants = async (paginationParams: CursorPaginationParams, filters: FilterParams[] = []) => {
        const restaurants = await findAllRestaurants(paginationParams, filters);
        return buildCursorPaginationResponse(restaurants, paginationParams.limit, paginationParams.sortBy, paginationParams.sortOrder);
    }

    updateRestaurantById = async(id: number, userId: number, systemRole: SystemRole, data: UpdateRestaurantByIdDTO) => {
        const restaurant = await findRestaurantById(id);
        if(!restaurant){
            throw restaurantNotFoundError;
        }
        if(systemRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== userId){
            throw UnAuthorisedError;
        }
        if(data.logoURL == undefined && data.name == undefined && data.primaryCountry == undefined){
            throw NoArgumentsCanBeUpdatedError;
        }
        
        const updatedRestaurant = await updateRestaurantById(id, data);
        return updatedRestaurant;
    }

    updateRestaurantStatus = async (id: number, userRole: SystemRole, data:UpdateRestaurantStatusDTO) => {
        if(userRole !== SystemRole.SYSTEM_ADMIN){
            throw UnAuthorisedError;
        }
        const restaurant = await findRestaurantById(id);
        if (!restaurant){
            throw restaurantNotFoundError;
        }
        const updatedRestaurant = await updateRestaurantStatus(id, data.status);
        return updatedRestaurant;

    }
}