import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { RestaurantBranchController } from "./controller/restaurant-branch.controller";
import { withCache } from "../../lib/cache/withCache";

export const restaurantBranchRoutes = Router();

const restaurantBranchController = container.resolve<RestaurantBranchController>(TOKENS.RestaurantBranchController);



restaurantBranchRoutes.get('/branches/nearby', withCache(3600), restaurantBranchController.findNearbyBranches);

restaurantBranchRoutes.post('/restaurants/:restaurantId/branches',
     authenticate,
     requireRestaurantMember('restaurantId'),
     rbac({resource:"core:branch", action:'create'}),
     restaurantBranchController.createBranch);

restaurantBranchRoutes.get('/restaurants/:restaurantId/branches', restaurantBranchController.getAllRestaurantBranchesById);

restaurantBranchRoutes.patch('/branches/:branchId',
     authenticate,
     requireBranchAccess('branchId'),
     rbac({resource:"core:branch", action:'update'}),
     restaurantBranchController.updateRestaurantBranchById);

restaurantBranchRoutes.patch('/branches/:branchId/status',authenticate, restaurantBranchController.updateRestaurantBranchStatusByAdmin); // system_admin only, checked in service