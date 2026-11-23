import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { CustomerAddressController } from "./controller/customer-address.controller";

export const customerAddressRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);


customerAddressRouter.get('/', authenticate, customerAddressController.getAllAdressesByUserId);
customerAddressRouter.post('/', authenticate, customerAddressController.createAddress);
customerAddressRouter.patch('/:addressId', authenticate, customerAddressController.updateAddress);
customerAddressRouter.delete('/:addressId', authenticate, customerAddressController.removeAddress);