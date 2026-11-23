import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Restaurant } from "../entity/restaurant.entity";
import { applyCursorPagination, applyFilters, CursorPaginationParams, FilterParams } from "../../../lib/http/pagination/cursor-pagination";

const RESTAURANT_COLUMNS = ['id', 'owner_id', 'name', 'logo_url', 'status', 'primary_country', 'created_at', 'updated_at', 'status_updated_at'];

function mapRowToRestaurant(row: any): Restaurant {
    return new Restaurant({
        id: row.id,
        name: row.name,
        ownerId: row.owner_id,
        logoURL: row.logo_url,
        status: row.status,
        primaryCountry: row.primary_country,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        statusUpdatedAt: row.status_updated_at
    });
}

function mapeRestaurantToRow(restaurant: Partial<Restaurant>): any {
    return{
        name: restaurant.name,
        owner_id: restaurant.ownerId,
        logo_url: restaurant.logoURL,
        status: restaurant.status,
        primary_country: restaurant.primaryCountry,
        created_at: restaurant.createdAt,
        updated_at: restaurant.updatedAt,
        status_updated_at: restaurant.statusUpdatedAt,
    };
}

export async function createRestaurant(restaurantData: Partial<Restaurant>, conn: Knex = db) {
    const [row] = await conn("restaurants").insert(mapeRestaurantToRow(restaurantData)).returning(RESTAURANT_COLUMNS);
    return mapRowToRestaurant(row);
}

export async function findAllRestaurants(paginationParams: CursorPaginationParams, filters: FilterParams[] = []): Promise<Restaurant[]> {
    let query = db("restaurants").select(RESTAURANT_COLUMNS);
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, paginationParams);
    console.log(query.toSQL().toNative());
    const rows = await query;
    return rows.map(mapRowToRestaurant);
    
    // repo before pagination and filtering
    // const rows = await db("restaurants").select(RESTAURANT_COLUMNS);
    // return rows.map(mapRowToRestaurant)

}

// TODO: find restaurant by id
export async function findRestaurantById(id: number){
    const row = await db("restaurants").select(RESTAURANT_COLUMNS).where('id', id).first();
    return row ? mapRowToRestaurant(row) : null;
}

// export async function updateRestaurantById(id: number, restaurantData: {name?: string, logoURL?: string, primaryCountry?: string}){
//     const updatedData: Record<string, unknown> = {updated_at: new Date()};
//     if(restaurantData.name !== undefined){
//         updatedData.name = restaurantData.name;
//     }
//     if(restaurantData.logoURL !== undefined){
//         updatedData.logo_url = restaurantData.logoURL;
//     }
//     if(restaurantData.primaryCountry !== undefined){
//         updatedData.primary_country = restaurantData.primaryCountry;
//     }

//     const [row] = await db("restaurants").where("id", id).update(updatedData).returning(RESTAURANT_COLUMNS);
//     return mapRowToRestaurant(row);


// }

export async function updateRestaurantById(id: number, data: {name?: string, logoUrl?: string, primaryCountry?: string}): Promise<Restaurant> {
    const [row] = await db("restaurants").where("id", id).update({
        name: data.name,
        logo_url: data.logoUrl,
        primary_country: data.primaryCountry,
        updated_at: new Date(),
    }).returning(RESTAURANT_COLUMNS);
    return mapRowToRestaurant(row);
} 
// this is another simple updateRestaurantById without being cautios regarding overwriting unpassed fields with undefined.
// as I tried it and it didn't overwrite, checked also knex docs and asked chatgpt.. it's okay not to pass all fields,
// the update method in knex will skip undefined, and won't overwrite it with null or empty string in database


export async function updateRestaurantStatus(id:number, status: string) {
    const now = new Date()
    const [row] = await db("restaurants").where("id", id).update({status, status_updated_at: now, updated_at: now}).returning(RESTAURANT_COLUMNS);
    return mapRowToRestaurant(row);

    
}
