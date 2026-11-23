import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { ProductController } from "./controller/product.controller";

export const productRoutes = Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);
    

productRoutes.post('/restaurants/:restaurantId/products', 
    authenticate, 
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:'create'}),
    productController.createProduct);

productRoutes.get('/restaurants/:restaurantId/categories', productController.findAllRestaurantCategories);

productRoutes.get('/branches/:branchId/products', productController.findProductByBranch);

productRoutes.get('/restaurants/:restaurantId/products', 
    authenticate, 
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:'read'}),
    productController.findProductByRestaurant);

productRoutes.get('/products/:id', productController.findProductById);

productRoutes.patch('/products/:productId', 
    authenticate, 
    requireBranchAccess('branchId'),
    rbac({resource:"core:product", action:'update'}),
    productController.updateProductAndBranchDetails)