import { db } from "../../../lib/knex/knex";
import { CustomerAddress } from "../entity/customer-address";

const ADDRESS_COLUMNS = [
    "id", "user_id", "label", "country", "city", "street",
    "building","floor_number", "apartment_number", "type", "latitude", "longitude", "is_default"
];

function mapRowToCustomerAddress(row: any){
    return new CustomerAddress({
        id: row.id,
        userId: Number(row.user_id),
        label: row.label,
        country: row.country,
        city: row.city,
        street: row.street,
        building: row.building,
        apartmentNumber: row.apartment_number,
        floorNumber: row.floor_number,
        type: row.type,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        isDefault: row.is_default,
    });
}

function mapCustomerAddresstoRow(customerAddress: Partial<CustomerAddress>){
    return {
        user_id: customerAddress.userId,
        label: customerAddress.label,
        country: customerAddress.country,
        city: customerAddress.city,
        street: customerAddress.street,
        building: customerAddress.building,
        apartment_number: customerAddress.apartmentNumber,
        floor_number: customerAddress.floorNumber,
        type: customerAddress.type,
        latitude: customerAddress.latitude,
        longitude: customerAddress.longitude,
        is_default: customerAddress.isDefault,
    };
}

export async function findAddressesByUserId(userId: number) {
    const rows = await db("customer_addresses").select(ADDRESS_COLUMNS).where("user_id", userId)
    return rows.map(mapRowToCustomerAddress)
}

export async function findAddressById(id: number) {
    const row = await db("customer_addresses").select(ADDRESS_COLUMNS).where("id", id).first();
    return row ? mapRowToCustomerAddress(row) : undefined
}

export async function createAddress(address: Partial<CustomerAddress>) {
    const [row] = await db("customer_addresses").insert(mapCustomerAddresstoRow(address)).returning(ADDRESS_COLUMNS);
    return mapRowToCustomerAddress(row);
}

export async function updateAddressById(id: number, data: Record<string, any>){
    const mapped: Record<string, any> = {};
    if (data.label !== undefined) mapped.label = data.label;
    if (data.country !== undefined) mapped.country = data.country;
    if (data.city !== undefined) mapped.city = data.city;
    if (data.street !== undefined) mapped.street = data.street;
    if (data.building !== undefined) mapped.building = data.building;
    if (data.apartmentNumber !== undefined) mapped.apartment_number = data.apartmentNumber;
    if (data.floorNumber !== undefined) mapped.floor_number = data.floor_number;
    if (data.type !== undefined) mapped.type = data.type;
    if (data.latitude !== undefined) mapped.latitude = data.latitude;
    if (data.longitude !== undefined) mapped.longitude = data.longitude;
    if (data.isDefault !== undefined) mapped.is_default = data.isDefault;

    const [row]= await db("customer_addresses").where("id", id).update(mapped).returning(ADDRESS_COLUMNS);
    return mapRowToCustomerAddress(row);

}

export async function deleteAddressById(id: number){
    await db("customer_addresses").where("id", id).delete();
}

export async function clearDefaultByUserId(userId: number){
    await db("customer_addresses").where("user_id", userId).where("is_default", true).update({is_default: false});
}