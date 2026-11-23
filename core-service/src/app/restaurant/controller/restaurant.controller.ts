import { Request, Response, NextFunction } from "express";
import { RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateRestaurantWithOwnerByAdminDTO, UpdateRestaurantByIdDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { parseCursorPaginationQuery, parseFilterQuery } from "../../../lib/http/pagination/parse-query";

@injectable()
export class RestaurantController {
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService){}

    findAllRestaurants = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const paginationParams = parseCursorPaginationQuery(req.query, ['name', 'id', 'status', 'createdAt'], 'id');
            const filters = parseFilterQuery(req.query, ['name', 'status', 'id', 'createdAt', 'primaryCountry']);
            const restaurants = await this.restaurantService.findAllRestaurants(paginationParams, filters);
            res.status(200).json(restaurants);

        } catch(error){

            next(error);

        }
    }

    findRestaurantById = async(req: Request, res: Response, next: NextFunction) => {
        try {
        const restaurant = await this.restaurantService.findRestaurantById(Number(req.params.restaurantId));
        res.status(200).json(restaurant);
        } catch (error){
            next(error);
        }
    }

    createRestaurantWithOwnerByAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateRestaurantWithOwnerByAdminDTO, req.body);
            const result = await this.restaurantService.createRestaurantWithOwnerByAdmin(req.user?.systemRole! as SystemRole, data);
            res.status(201).json({message: "Restaurant and User created", result});
        } catch (error){
            next(error)
        }
    }

    updateRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateRestaurantByIdDTO, req.body);
            const result = await this.restaurantService.updateRestaurantById(Number(req.params.restaurantId), req.user?.userId!, req.user?.systemRole as SystemRole, data);
            res.status(200).json({message: "Restaurant updated", restaurant: result});
        } catch (error){
            next(error)
        }
    }

    updateRestaurantStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateRestaurantStatusDTO, req.body);
            const result = await this.restaurantService.updateRestaurantStatus(Number(req.params.restaurantId), req.user?.systemRole as SystemRole, data);
            res.status(200).json({message: "Restaurant Status Updated", restaurant: result});
        } catch (error){
            next(error)
        }
    }
}