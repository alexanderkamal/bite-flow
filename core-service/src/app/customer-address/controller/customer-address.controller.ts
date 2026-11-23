import { NextFunction, Request, Response } from "express";
import { CustomerAddressService } from "../service/customer-address.service";
import { notAuthenticatedError } from "../errors";
import { validateBody } from "../../../lib/validation/validate";
import { CreateAddressDTO, UpdateAddressDTO } from "../dto/customer-address.dto";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class CustomerAddressController{
    constructor(@inject(TOKENS.CustomerAddressService) private readonly customerAddressService: CustomerAddressService) {}

    getAllAdressesByUserId = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user?.userId!
            if (!userId){
                throw notAuthenticatedError
            }
            const addresses = await this.customerAddressService.getAddressesByUserId(userId);
            res.status(200).json({data: addresses})

        } catch (error){
            next(error)
        }
    }

    createAddress = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user?.userId!
            if (!userId){
                throw notAuthenticatedError
            }

            const addressData = await validateBody(CreateAddressDTO, req.body)
            const address = await this.customerAddressService.createNewAddress(userId, addressData);

            res.status(201).json({message: "Address Added", address})

        } catch (error){
            next(error)
        }

    }

    updateAddress = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user?.userId!
            if (!userId){
                throw notAuthenticatedError
            }

            const addressData = await validateBody(UpdateAddressDTO, req.body);
            const addresId = Number(req.params.addressId)
            const updatedAddress = await this.customerAddressService.updateAddress(userId, addresId, addressData)
            res.status(200).json({message: "Address Updated", updatedAddress})

        } catch (error){
            next(error)
        }
    }

    removeAddress = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user?.userId!
            if (!userId){
                throw notAuthenticatedError
            }
            const addressId = Number(req.params.addressId)
            await this.customerAddressService.deleteAddress(userId, addressId)
            res.status(200).json({message: "Address deleted"})
        } catch(error){
            next(error)
        }
    }
}
