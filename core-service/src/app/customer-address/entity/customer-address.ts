import { AddressType } from "../enums";

export class CustomerAddress {
    id: number;
    userId: number;
    label: string;
    country: string;
    city: string;
    street: string;
    building: string | null;
    floorNumber: string | null;
    apartmentNumber: string | null;
    type: AddressType;
    latitude: number;
    longitude: number;
    isDefault: boolean;

    constructor(data: Partial<CustomerAddress> ){
        this.id = data.id!;
        this.userId = data.userId!;
        this.label = data.label!;
        this.country = data.country!;
        this.city = data.city!;
        this.street = data.street!;
        this.building = data.building ?? null;
        this.apartmentNumber = data.apartmentNumber ?? null;
        this.floorNumber = data.floorNumber ?? null;
        this.type = data.type!;
        this.latitude = data.latitude!;
        this.longitude = data.longitude!;
        this.isDefault = data.isDefault!;
    }
}