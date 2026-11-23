import { Request, Response, NextFunction } from "express";
import { SystemRole } from "../../app/user/enums";
import { branchUnAuthorisedError, notAuthenticatedError, restaurantUnAuthorisedError, UnAuthorisedError } from "./errors";
import { PermissionCacheService } from "../../app/rbac/service/permission-cache.service";
import { TOKENS } from "../di/tokens";
import { container } from "../di/container";

export function requireRestaurantMember(paramName: string= 'resturantId') {
    return async (req: Request, res: Response, next: NextFunction) => {
        const restaurantId = parseInt(req.params[paramName] as string); // req.params.restaurantId
        if(!restaurantId) {
            return res.status(500).json({"message": "something went wrong"}); // TODO: could be changed with throw AppError????? 
        }
        if(req.user?.systemRole == SystemRole.SYSTEM_ADMIN){
            return next();
        }

        if(Number(req.user?.restaurantId) !== Number(restaurantId)){
            throw restaurantUnAuthorisedError;
        }
        return next();
    }
}

export function requireBranchAccess(paramName: string= 'branchId') {
    return async (req: Request, res: Response, next: NextFunction) => {

        if(req.user?.systemRole == SystemRole.SYSTEM_ADMIN){
            return next();
        }

        if(req.user?.restaurantRole == 'owner'){
            return next();
        }

        const branchId = parseInt(req.params[paramName] as string) || parseInt(req.query[paramName] as string); 
        if(!branchId) {
            return next(); // in some endpoints, the branchId is optional, like update product, so we just skip the check if not provided 
            // so the service should handle this case or we might go through another approach or workaround later.  
        }

        const userBranchIds = req.user?.branchIds || [];
        if(!userBranchIds.includes(branchId)){
            throw branchUnAuthorisedError;
        }
        return next();
    }
}

export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean;
}


// check for permissions
// system admin bypass this
// restaurant users must have permissions for their role

// router.post('/products', authenticate, rbac({resource:"product",action:"create"}), productController.create)


export function rbac(options: RBACOptions){
    return async (req: Request, res: Response, next: NextFunction) => {

        try {

        
        if (!req.user){
            throw notAuthenticatedError;
        }

        const {resource, action, allowSystemAdmin = true} = options;

        // if he is a system admin -> bypass
        if(allowSystemAdmin && req.user.systemRole == SystemRole.SYSTEM_ADMIN){
            return next();
        }

        // if restaurant user
        // 1. fetch permissions
        // 2. check if the permissions has the action for this resource
        if(req.user.systemRole == SystemRole.RESTAURANT_USER) {
            const permissionCacheService = container.resolve<PermissionCacheService>(TOKENS.PermissionCacheService);
            const permissions = await permissionCacheService.getPermissions(req.user.restaurantRole!);
            if(!permissionCacheService.hasPermission(permissions, resource, action)) {
                throw UnAuthorisedError;
            }
            return next();
        }
        throw UnAuthorisedError;

    } catch(error){
        next(error);
    }

    }
}