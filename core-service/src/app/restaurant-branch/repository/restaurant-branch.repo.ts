import { Knex } from "knex";
import { RestaurantBranch } from "../entity/restaurant-branch.entity";
import { db } from "../../../lib/knex/knex";


const BRANCH_COLUMNS = ['id', 'restaurant_id', 'label', 'country_code', 'address_text', 'longitude', 
    'latitude', 'is_active', 'opens_at', 'closes_at', 'accept_orders', 'delivery_radius', 'currency', 'commission', 'created_at', 'updated_at'];

function mapRowToBranch (row: any){
    return new RestaurantBranch({
        id: row.id,
        label: row.label,
        restaurantId: row.restaurant_id,
        addressText: row.address_text,
        countryCode: row.country_code,
        longitude: row.longitude,
        latitude: row.latitude,
        isActive: row.is_active,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        acceptOrders: row.accept_orders,
        deliveryRadius: row.delivery_radius,
        currency: row.currency,
        commission: row.commission,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    })
}

function mapBranchToRow(restaurantBranch: Partial<RestaurantBranch>){
        return {
        label: restaurantBranch.label,
        restaurant_id: restaurantBranch.restaurantId,
        address_text: restaurantBranch.addressText,
        country_code: restaurantBranch.countryCode,
        longitude: restaurantBranch.longitude,
        latitude: restaurantBranch.latitude,
        is_active: restaurantBranch.isActive,
        opens_at: restaurantBranch.opensAt,
        closes_at: restaurantBranch.closesAt,
        accept_orders: restaurantBranch.acceptOrders,
        delivery_radius: restaurantBranch.deliveryRadius,
        currency: restaurantBranch.currency,
        commission: restaurantBranch.commission,
        created_at: restaurantBranch.createdAt,
        updated_at: restaurantBranch.updatedAt 
        };
}

export async function createBranch (branchData: Partial <RestaurantBranch>, conn: Knex = db){
    const [row] = await conn("restaurant_branches").insert(mapBranchToRow(branchData)).returning(BRANCH_COLUMNS);
    return mapRowToBranch(row);
}

export async function findNearbyBranches(lng: number, lat: number) {
    const result = await db.raw(`
        SELECT
        r.name, b.label, b.id, b.restaurant_id, b.address_text, b.longitude, b.latitude, b.is_active, b.accept_orders, b.currency, 
        b.opens_at, b.closes_at, r.logo_url
        FROM restaurant_branches b JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.is_active = true AND r.status = 'active'
        AND ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, b.delivery_radius*1000)
        `, [lng, lat]);

    return result.rows.map((row: any) => ({
        id: row.id,
        addressText: row.address_text,
        label: row.label,
        latitude: row.latitude,
        longitude: row.longitude,
        isActive: row.is_active,
        acceptOrders: row.accept_orders,
        currency: row.currency,
        restaurantName: row.name,
        logoUrl: row.logo_url,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
    }));
    
}

export async function getAllRestaurantBranchesById(id: number){
    const rows = await db("restaurant_branches").select(BRANCH_COLUMNS).where("restaurant_id", id)
    return rows.map(mapRowToBranch);
}

export async function findRestaurantBranchById(id: number){
    const row = await db("restaurant_branches").select(BRANCH_COLUMNS).where("id", id).first()
    return row ? mapRowToBranch(row) : undefined;
}

export async function updateRestaurantBranchById(id:number, data: Record<string, any>) {
    const [row] = await db("restaurant_branches").where("id", id).update({
        label: data.label,
        address_text: data.addressText,
        latitude: data.latitude,
        longitude: data.longitude,
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        delivery_radius: data.deliveryRadius,
        currency: data.currency,
        accept_orders: data.acceptOrders,
        updated_at: new Date(),
    }).returning(BRANCH_COLUMNS);
    return mapRowToBranch(row);
}

export async function updateRestaurantBranchStatusById (id: number, data: {commission?: number, isActive?: boolean}) {
    const [row] = await db("restaurant_branches").where("id", id).update({
        commission: data.commission,
        is_active: data.isActive,
        updated_at: new Date()
    }).returning(BRANCH_COLUMNS);
    return mapRowToBranch(row);
}