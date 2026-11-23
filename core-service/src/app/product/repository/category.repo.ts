import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductCategory } from "../entity/product-category.entity";

const CATEGORY_COLUMNS = ['id', 'restaurant_id', 'name', 'created_at', 'updated_at'];

function mapRowToCategory(row: any): ProductCategory {
    return new ProductCategory({
        id: row.id,
        restaurantId: row.restaurant_id,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    });
}

function mapCategoryToRow(category: Partial<ProductCategory>) {
    return {
        restaurant_id: category.restaurantId,
        name: category.name,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
    };
}

export async function createCategory(categoryData: Partial<ProductCategory>, conn: Knex = db) {
    const [row] = await conn("product_categories").insert(mapCategoryToRow(categoryData)).returning(CATEGORY_COLUMNS);
    return mapRowToCategory(row);
}

export async function findCategoryOfRestaurantByName(restaurantId: number, categoryName: string) {
    const row = await db("product_categories").select(CATEGORY_COLUMNS)
    .where("restaurant_id", restaurantId).where("name", categoryName).first();
    return row ? mapRowToCategory(row) : undefined;
}

export async function findCategoriesByRestaurantId (restaurantId: number) {
    const rows = await db("product_categories").select(CATEGORY_COLUMNS)
    .where("restaurant_id", restaurantId);
    return rows.map(mapRowToCategory);
}