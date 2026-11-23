import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Product } from "../entity/product.entity";

const PRODUCT_COLUMNS = ['id', 'name', 'description', 'image_url', 'restaurant_id', 'category_id', 'created_at', 'updated_at', 'deleted_at'];

function mapRowToProduct(row: any): Product {
    return new Product({
        id: row.id,
        name: row.name,
        description: row.description,
        imageURL: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    })
}

function mapProductToRow (product: Partial<Product>) {
    return {
        name: product.name,
        description: product.description,
        image_url: product.imageURL,
        restaurant_id: product.restaurantId,
        category_id: product.categoryId,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        deleted_at: product.deletedAt,
    }
}

export async function createProduct(productData: Partial<Product>, conn: Knex = db) {
    const [row] = await conn("products").insert(mapProductToRow(productData)).returning(PRODUCT_COLUMNS);
    return mapRowToProduct(row);
}

export async function findProductByBranch (branhId: number) {
    const rows = await db("products as p")
    .join("product_branch_details as pbd", "p.id", "pbd.product_id")
    .leftJoin("product_categories as pc", "p.category_id", "pc.id")
    .where("pbd.branch_id", branhId).whereNull("deleted_at")
    .select(
        "p.id",
            "p.name",
            "p.description",
            "p.image_url",
            "p.restaurant_id",
            "p.category_id",
            "pc.name as category_name",
            "pbd.price",
            "pbd.stock",
            "pbd.is_available",
    );
    return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}

export async function findProductByRestaurantId(restaurantId:number) {
    const rows = await db("products")
        .select(PRODUCT_COLUMNS)
        .where("restaurant_id", restaurantId)
        .whereNull("deleted_at");
    return rows.map(mapRowToProduct);
}

export async function findProductById (productId: number) {
    const row = await db("products").select(PRODUCT_COLUMNS).where("id", productId).whereNull("deleted_at").first();
    return row ? mapRowToProduct(row) : undefined;
}

export async function updateProduct(id: number, data: Record<string, any>, conn: Knex = db) {
    const [row] = await conn("products").where("id", id).update({
        name: data.name,
        description: data.description,
        image_url: data.imageURL,
        category_id: data.categoryId,
        updated_at: new Date(),
    }).returning(PRODUCT_COLUMNS);
    return mapRowToProduct(row);
}