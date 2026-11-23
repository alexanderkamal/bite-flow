import { injectable } from "tsyringe"
import { CreateAddressDTO, UpdateAddressDTO } from "../dto/customer-address.dto"
import { AddressNotFoundError, notAuthenticatedError } from "../errors"
import { clearDefaultByUserId, createAddress, deleteAddressById, findAddressById, findAddressesByUserId, updateAddressById } from "../repository/customer-address.repo"

@injectable()
export class CustomerAddressService{

    getAddressesByUserId = async(userId: number) => {
        const addresses = await findAddressesByUserId(userId)
        return addresses
    }

    createNewAddress = async(userId: number, addressData: CreateAddressDTO) => {
        if(addressData.isDefault){
            await clearDefaultByUserId(userId);
        }
        const address = await createAddress({userId, ...addressData})
        return address
    }

    updateAddress = async(userId: number, addressId: number, addressData: UpdateAddressDTO) => {
        const address = await findAddressById(addressId)
        if(!address || userId != address.userId){
            throw AddressNotFoundError;
        }
        if(addressData.isDefault){
            await clearDefaultByUserId(userId);
        }
        const updatedAddress = await updateAddressById(addressId, addressData)
        return updatedAddress;
    }

    deleteAddress = async(userId: number, addressId: number) => {
        const address = await findAddressById(addressId)
        if(!address || userId != address.userId){
            throw AddressNotFoundError;
        }
        await deleteAddressById(addressId)
    }
}
