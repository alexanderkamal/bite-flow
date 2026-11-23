import { Request, Response, NextFunction } from "express";
import { RestaurantBranchService } from "../service/restaurant-branch.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateRestaurantBranchDTO, UpdateBranchDTO, UpdateRestaurantBranchStatusDTO } from "../dto/restaurant-branch.dto";
import { SystemRole } from "../../user/enums";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class RestaurantBranchController {
    constructor(@inject(TOKENS.RestaurantBranchService) private readonly restaurantBranchService: RestaurantBranchService){}

    findNearbyBranches = async(req: Request, res: Response, next: NextFunction) => {
        try {

            const branches = await this.restaurantBranchService.findNearby(Number(req.query.lng), Number(req.query.lat));
            res.status(200).json({data: branches});
        } catch(error){
            next(error);
        }
    }

    createBranch = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const branchData = await validateBody(CreateRestaurantBranchDTO, req.body);
            const branch = await this.restaurantBranchService.createBranch(req.user?.userId!, req.user?.systemRole! as SystemRole, Number(req.params.restaurantId), branchData);
            res.status(201).json({message: "New Branch Added", branch})
        } catch (error){
            next(error)
        }
    }

    getAllRestaurantBranchesById = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.restaurantBranchService.getAllRestaurantBranchesById(Number(req.params.restaurantId));
            res.status(200).json({data: branches})
        } catch (error) {
            next(error)
        }
    }

    updateRestaurantBranchById = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchDTO, req.body);
            const branch = await this.restaurantBranchService.updateRestaurantBranchById(Number(req.params.branchId), req.user?.userId!, req.user?.systemRole as SystemRole, data);
            res.status(200).json({message: "Branch updated", branch});
        } catch (err) {
            next(err);
        }
    }

    updateRestaurantBranchStatusByAdmin = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateRestaurantBranchStatusDTO, req.body);
            const branch = await this.restaurantBranchService.updateRestaurantBranchStatusByAdmin(Number(req.params.branchId), req.user?.systemRole as SystemRole, data);
            res.status(200).json({message: "Branch updated", branch});
        } catch (err) {
            next(err);
        }
    }



}