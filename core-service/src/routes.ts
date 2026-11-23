import {Router} from 'express';
import { healthRoutes } from './app/health/health.routes';
import { authRoutes } from './app/auth/routes';
import { userRoutes } from './app/user/routes';
import { customerAddressRouter } from './app/customer-address/routes';
import { restaurantRoutes } from './app/restaurant/routes';
import { restaurantBranchRoutes } from './app/restaurant-branch/routes';
import { productRoutes } from './app/product/routes';
import { rbacRouter } from './app/rbac/routes';


export const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/auth', authRoutes);
routes.use('/user', userRoutes)
routes.use('/customer/addresses', customerAddressRouter)
routes.use('/restaurant', restaurantRoutes)
routes.use('/', restaurantBranchRoutes)
routes.use('/', productRoutes)
routes.use('/', rbacRouter)