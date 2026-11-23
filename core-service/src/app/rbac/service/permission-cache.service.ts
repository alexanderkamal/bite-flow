import { injectable } from "tsyringe";
import { toMs } from "../../../pkg/utils/time";
import { getPermissionsByRoleName } from "../repository/permission.repo";

@injectable()
export class PermissionCacheService {
    private cache: Map<string, {permissions: string[], cachedAt: number}> = new Map();
    private readonly TTL = toMs(1, 'h');

    async getPermissions(roleName: string) {
        // check cache, if it is in the cache, return it, if not ftch from db
        const cached = this.cache.get(roleName);
        if (cached && Date.now() - cached.cachedAt < this.TTL){ 
            return cached.permissions;
        }
        // check cache, if it is in the cache, return it, if not ftch from db
        const permissions = await getPermissionsByRoleName(roleName);
        this.cache.set(roleName, {permissions, cachedAt: Date.now()});

        return permissions;
    }

    
    // pass the permissions of the user, after getting it using getPermission then.. with the required resource and action 
    hasPermission(permissions: string[], resource: string, action: string) {
        return permissions.includes(`${resource}:${action}`);
    }
    
}
