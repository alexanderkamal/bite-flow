import { inject, injectable } from "tsyringe";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { db } from "../../../lib/knex/knex";
import { BranchNotFoundError } from "../../restaurant-branch/errors";
import { RestaurantBranchService } from "../../restaurant-branch/service/restaurant-branch.service";
import { restaurantNotFoundError } from "../../restaurant/errors";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { BranchFieldsPassedButNoBranchIdPassedError, branchIdPassesButNoBranchFieldsPassedError, BranchNotRelatedToRestaurantError, NoArgumentsCanBeUpdatedError, productNotFoundError } from "../errors";
import { createCategory, findCategoriesByRestaurantId, findCategoryOfRestaurantByName } from "../repository/category.repo";
import { updateBranchDetails } from "../repository/product-branch-details.repo";
import { createProduct, findProductByBranch, findProductById, findProductByRestaurantId, updateProduct } from "../repository/product.repo";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class ProductService {
    constructor(
        @inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService,
        @inject(TOKENS.RestaurantBranchService) private readonly restaurantBranchService: RestaurantBranchService
    ){}
    createProduct = async (restaurantId: number, userId: number, userRole: SystemRole, productData: CreateProductDTO) => {
        const restaurant = await this.restaurantService.findRestaurantById(restaurantId);
        if (!restaurant) {
            throw restaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)){
            throw UnAuthorisedError;
        }
        const now = new Date()
        const trx = await db.transaction();
        let categoryId: number | null= null;
        try {
            if(productData.categoryName) {
            let category = await findCategoryOfRestaurantByName(restaurantId, productData.categoryName);
            if (!category){
                category = await createCategory({
                    restaurantId: restaurantId,
                    name: productData.categoryName,
                    createdAt: now,
                    updatedAt: now,
                }, trx);
            }
            categoryId = category.id;
        }
        const product = await createProduct({
            name: productData.name,
            description: productData.description,
            imageURL: productData.imageUrl,
            restaurantId: restaurantId,
            categoryId: categoryId,
            createdAt: now,
            updatedAt: now
        }, trx);

        await trx.commit();

        return product;


        } catch (error){
            await trx.rollback();
            throw error;
        }
        
    }


    findAllRestaurantCategories = async (restaurantId: number) => {
        const restaurant = await this.restaurantService.findRestaurantById(restaurantId);
        if(!restaurant) {
            throw restaurantNotFoundError;
        }
        return await findCategoriesByRestaurantId(restaurantId);
    }

    findProductByBranch = async (branchId: number) => {
        const branch = await this.restaurantBranchService.findRestaurantBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }
        return await findProductByBranch(branchId);
    }

    findProductByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await this.restaurantService.findRestaurantById(restaurantId);
        if (!restaurant) {
            throw restaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }
        return await findProductByRestaurantId(restaurantId);
    }

    findProductById = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) {
            throw productNotFoundError;
        }
        return product;
    }

    updateProduct = async (productId: number, userId: number, userRole: SystemRole, data: UpdateProductDTO, branchId?: number) => {
        if (Object.values(data).every(value => value === undefined)){
                    throw NoArgumentsCanBeUpdatedError;
        }
        const product = await findProductById(productId);
        if(!product){
            throw productNotFoundError;
        }
        const restaurant = await this.restaurantService.findRestaurantById(product.restaurantId);
        if (!restaurant){
            throw restaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }
        let branch;
        if (branchId !== undefined){
            branch = await this.restaurantBranchService.findRestaurantBranchById(branchId);
            if(!branch){
                throw BranchNotFoundError;
            }
            if (Number(branch.restaurantId) !== Number(restaurant.id)){
                throw BranchNotRelatedToRestaurantError;
            }
        }
        if (branchId !== undefined && data.price == undefined && data.stock == undefined && data.isAvailable == undefined ) {
            throw branchIdPassesButNoBranchFieldsPassedError;
        }
        if (branchId == undefined && (data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined)) {
            throw BranchFieldsPassedButNoBranchIdPassedError;
        }
        const now = new Date()
        const trx = await db.transaction();
        try {

            let categoryId: number | undefined = undefined;
            if (data.categoryName) {
                let category = await findCategoryOfRestaurantByName(product.restaurantId, data.categoryName);
                if (!category) {
                    category = await createCategory({
                        restaurantId: product.restaurantId,
                        name: data.categoryName,
                        createdAt: now,
                        updatedAt: now,
                    }, trx);
                }
                categoryId = category.id;
                // TODO: this condition will have race condition !!!! 
                // might two transactions check for category find it doesn't exist then create one
                // one of them will create the other will face error as violate unique (name, restauran id) constraint
            }

            let updatedProduct;
            if (data.name !== undefined || data.description !== undefined || data.imageURL !== undefined || data.categoryName !== undefined){
                updatedProduct = await updateProduct(productId, {
                name: data.name,
                description: data.description,
                imageURL: data.imageURL,
                categoryId,
                }, trx);
            }
            

            let updatedBranchDetails;
            if (branchId !== undefined) {
            updatedBranchDetails = await updateBranchDetails(branchId, productId, {
                price: data.price,
                stock: data.stock,
                isAvailable: data.isAvailable,
            }, trx);
            }

            await trx.commit();

            return {product: updatedProduct, updatedBranchDetails};


        } catch (error) {
            await trx.rollback();
            throw error;
        }

        
    }


    // note: in most of the repo calls, I passed values that might contains undefined values,
    // as I am using knex, which handles the undefined values by not assigning it, and only
    // update, or insert the defined values... in Knex docs its okay to do this
    // but if we are using something else we should handle it from service
    // by only passing assigned values which is easy to do.

}
