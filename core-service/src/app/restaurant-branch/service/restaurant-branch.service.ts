import { inject, injectable } from "tsyringe";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { restaurantNotFoundError } from "../../restaurant/errors";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateRestaurantBranchDTO, UpdateBranchDTO, UpdateRestaurantBranchStatusDTO } from "../dto/restaurant-branch.dto";
import { BranchNotFoundError, NoArgumentsCanBeUpdatedError } from "../errors";
import { createBranch, findNearbyBranches, findRestaurantBranchById, getAllRestaurantBranchesById, updateRestaurantBranchById, updateRestaurantBranchStatusById } from "../repository/restaurant-branch.repo";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class RestaurantBranchService{
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService) {}
    createBranch = async (userId: number, userRole: SystemRole, restaurantId: number, branchDTO: CreateRestaurantBranchDTO) => {
        const restaurant = await this.restaurantService.findRestaurantById(restaurantId);
        if (!restaurant){
            throw restaurantNotFoundError;
        } 
        if (userRole != SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)){
            throw UnAuthorisedError;
        }

        const now = new Date();
        const branch = await createBranch({
            restaurantId: restaurantId,
            label: branchDTO.label,
            countryCode: branchDTO.countryCode,
            latitude: branchDTO.latitude,
            longitude: branchDTO.longitude,
            addressText: branchDTO.addressText,
            isActive: false,
            opensAt: branchDTO.opensAt,
            closesAt: branchDTO.closesAt,
            currency: branchDTO.currency,
            deliveryRadius: branchDTO.deliveryRadius,
            commission: 0,
            createdAt: now,
            updatedAt: now,
            acceptOrders: true,
        });

        return branch;


    }

    findNearby = async (lng: number, lat: number) => {
        const branches = await findNearbyBranches(lng, lat);
        return branches;
    }

    getAllRestaurantBranchesById = async (restaurantId: number) => {
        const restaurant = await this.restaurantService.findRestaurantById(restaurantId);
        if (!restaurant){
            throw restaurantNotFoundError;
        }
        const branches = await getAllRestaurantBranchesById(restaurantId);
        return branches;
    }

    updateRestaurantBranchById = async (branchId:number, userId: number, userRole: SystemRole, data: UpdateBranchDTO) => {
        const branch = await findRestaurantBranchById(branchId);
        if(!branch){
            throw BranchNotFoundError;
        }
        const restaurant = await this.restaurantService.findRestaurantById(branch.restaurantId);
        if (!restaurant){
            throw restaurantNotFoundError
        }
        if (userRole != SystemRole.SYSTEM_ADMIN && userId != Number(restaurant.ownerId)){
            throw UnAuthorisedError;
        }
        if (Object.values(data).every(value => value === undefined)){
            throw NoArgumentsCanBeUpdatedError;
        }
        return await updateRestaurantBranchById(branchId, data);
    }

    updateRestaurantBranchStatusByAdmin = async(branchId: number, userRole: SystemRole, data: UpdateRestaurantBranchStatusDTO) => {
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw UnAuthorisedError;
        }
        const branch = await findRestaurantBranchById(branchId);
        if (!branch){
            throw BranchNotFoundError;
        }
        if (Object.values(data).every(value => value === undefined)){
            throw NoArgumentsCanBeUpdatedError;
        }
        return await updateRestaurantBranchStatusById(branchId, data)
    }

    findRestaurantBranchById = async(branchId: number) => {
        const branch = await findRestaurantBranchById(branchId);
        if (!branch){
            throw BranchNotFoundError;
        }
        return branch;
    }
}
