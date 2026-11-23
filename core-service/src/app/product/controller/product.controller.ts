import { NextFunction, Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { SystemRole } from "../../user/enums";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) {}

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.createProduct(Number(req.params.restaurantId), Number(req.user?.userId), req.user?.systemRole as SystemRole, data);
            res.status(201).json({message: "Product created", product});
        } catch(error) {
            next(error);
        }
    }

    findAllRestaurantCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findAllRestaurantCategories(Number(req.params.restaurantId));
            res.status(200).json({data: results});
        } catch (err) {
            next(err);
        }
    }

    findProductByBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findProductByBranch(Number(req.params.branchId));
            res.status(200).json({data: results});
        } catch (err) {
            next(err);
        }
    }

    findProductByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findProductByRestaurant(
                Number(req.params.restaurantId),
                req.user?.userId!,
                req.user?.systemRole! as SystemRole,
            );
            res.status(200).json({data: results});
        } catch (err) {
            next(err);
        }
    }

    findProductById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await this.productService.findProductById(Number(req.params.id));
            res.status(200).json(product);
        } catch (err) {
            next(err);
        }
    }

    updateProductAndBranchDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateProductDTO, req.body);
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
            const result = await this.productService.updateProduct(
                Number(req.params.productId),
                req.user?.userId!,
                req.user?.systemRole! as SystemRole,
                data,
                branchId
            );
            res.status(200).json({message: "Product updated", ...result});
        }
        catch(error){
            next(error);
        }
    }
}
