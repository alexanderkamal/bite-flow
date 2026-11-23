import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { RestaurantController } from "./controller/restaurant.controller";
import { TOKENS } from "../../lib/di/tokens";

export const restaurantRoutes = Router();

const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);


restaurantRoutes.get("/", restaurantController.findAllRestaurants);
restaurantRoutes.get("/:restaurantId", restaurantController.findRestaurantById);
restaurantRoutes.post('/', authenticate, restaurantController.createRestaurantWithOwnerByAdmin); // system_admin only, checked in service
restaurantRoutes.patch('/:restaurantId',
    authenticate, 
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:restaurant", action:'update'}),
 restaurantController.updateRestaurantById);
 
restaurantRoutes.patch('/:restaurantId/status', authenticate, restaurantController.updateRestaurantStatus); // system_admin only, checked in service