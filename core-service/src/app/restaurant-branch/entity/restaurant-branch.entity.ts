import {Currency} from "../enums";

export class RestaurantBranch {
    id: number;
    restaurantId: number;
    countryCode: string;
    addressText:string;
    label: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    opensAt: string;
    closesAt: string;
    acceptOrders: boolean;
    createdAt: Date;
    updatedAt: Date;
    deliveryRadius: number; // km
    currency: Currency;
    commission: number;

    constructor(data: Partial<RestaurantBranch>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.countryCode = data.countryCode!;
        this.addressText = data.addressText!;
        this.label = data.label!;
        this.latitude = data.latitude!;
        this.longitude = data.longitude!;
        this.isActive = data.isActive!;
        this.opensAt = data.opensAt!;
        this.closesAt = data.closesAt!;
        this.acceptOrders = data.acceptOrders!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deliveryRadius = data.deliveryRadius ?? 0;
        this.currency = data.currency!;
        this.commission = data.commission ?? 0;
    }
}