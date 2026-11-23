import {container} from 'tsyringe';
import {TOKENS} from './tokens';

// Lib/infrastructure/
// import {cacheProvider} from '../cache/cache-provider';
import {Logger} from "../logger/logger";

// Services
import {AuthService} from "../../app/auth/service/auth.service";
import {UserService} from "../../app/user/service/user.service";
import {RestaurantService} from "../../app/restaurant/service/restaurant.service";
import { RestaurantBranchService } from '../../app/restaurant-branch/service/restaurant-branch.service';
import {ProductService} from "../../app/product/service/product.service";
import {MemberService} from "../../app/rbac/service/member.service";
import {CustomerAddressService} from "../../app/customer-address/service/customer-address.service";
import {PermissionCacheService} from "../../app/rbac/service/permission-cache.service";

// Controllers
import {AuthController} from "../../app/auth/controller/auth.controller";
import {UserController} from "../../app/user/controller/user.controller";
import {RestaurantController} from "../../app/restaurant/controller/restaurant.controller";
import {ProductController} from "../../app/product/controller/product.controller";
import {MemberController} from "../../app/rbac/controller/member.controller";
import {CustomerAddressController} from "../../app/customer-address/controller/customer-address.controller";
import { RestaurantBranchController } from '../../app/restaurant-branch/controller/restaurant-branch.controller';
import { cacheProvider } from '../cache/init';
import { emailProvider } from '../email/inits';


// Services
container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<RestaurantService>(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton<RestaurantBranchService>(TOKENS.RestaurantBranchService, RestaurantBranchService);
container.registerSingleton<ProductService>(TOKENS.ProductService, ProductService);
container.registerSingleton<MemberService>(TOKENS.MemberService, MemberService);
container.registerSingleton<CustomerAddressService>(TOKENS.CustomerAddressService, CustomerAddressService);
container.registerSingleton<PermissionCacheService>(TOKENS.PermissionCacheService, PermissionCacheService);
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);

// Controllers
container.registerSingleton<AuthController>(TOKENS.AuthController, AuthController);
container.registerSingleton<UserController>(TOKENS.UserController, UserController);
container.registerSingleton<RestaurantController>(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton<RestaurantBranchController>(TOKENS.RestaurantBranchController, RestaurantBranchController);
container.registerSingleton<ProductController>(TOKENS.ProductController, ProductController);
container.registerSingleton<MemberController>(TOKENS.MemberController, MemberController);
container.registerSingleton<CustomerAddressController>(TOKENS.CustomerAddressController, CustomerAddressController);

// Lib/infrastructure/
container.registerInstance(TOKENS.CacheProvider, cacheProvider);
container.registerSingleton<Logger>(TOKENS.Logger, Logger);
container.registerInstance(TOKENS.EmailProvider, emailProvider)

export {container};