import { User } from "../entity/user.entity";
import { db } from "../../../lib/knex/knex";
import { phoneAlreadyInUseError } from "../error";
import { Knex } from "knex";


const USER_COLUMNS = [ "id", "name", "email", "phone", "password_hash", "system_role", "created_at", "updated_at", "deleted_at" ];

function mapRowToUser(row: any): User {
    return new User({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        passwordHash: row.password_hash,
        systemRole: row.system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
    });
}

function mapUserToRowNoDeletedAt(user: Partial<User>): any {
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password_hash: user.passwordHash,
        system_role: user.systemRole,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
    };
}

export async function findUserExistsByEmailOrPhone(email: string, phone: string): Promise<boolean> {
    const result = await db.raw(`
        SELECT EXISTS (SELECT 1 FROM users WHERE email = ? OR phone = ? AND deleted_at IS NULL) AS exists`
        , [email, phone]);
    return result.rows[0].exists;
}

export async function findUserExistsById(id: number): Promise<boolean> {
    const result = await db.raw(`
        SELECT EXISTS (SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL) AS exists`
        , [id]);
    return result.rows[0].exists;
}

export async function findUserExistsByEmail(email: string): Promise<boolean> {
    const result = await db.raw(`
        SELECT EXISTS (SELECT 1 FROM users WHERE email = ? AND deleted_at IS NULL) AS exists`
        , [email]);
    return result.rows[0].exists;
}


export async function findUserByEmail(email: string): Promise<User | null> {
    const row = await db("users").select(USER_COLUMNS).where("email", email).whereNull("deleted_at").first();

    return row ? mapRowToUser(row) : null;
}

export async function findUserById(id: number): Promise<User | null> {
    const row = await db("users").select(USER_COLUMNS).where("id", id).whereNull("deleted_at").first();
    return row ? mapRowToUser(row) : null;
}

export async function createUser(user: Partial <User>, conn: Knex = db): Promise<User> {
    const [row] = await conn("users").insert(mapUserToRowNoDeletedAt(user)).returning(USER_COLUMNS);
    return mapRowToUser(row);
}

export async function updateUserPassword(id: number, passwordHash: string) {
    await db("users")
        .where("id", id)
        .update({
            password_hash: passwordHash,
            updated_at: new Date()
        })
}

export async function updateUser(id: number, userData: Partial <{name: String, phone: String}>) {
    try{
    const [row] = await db("users").where("id", id).update({
        ...userData,
        updated_at: new Date(),
    }).returning(USER_COLUMNS);
    return mapRowToUser(row)
} catch (error: any){
    if(error.code == "23505" && error.constraint == "users_phone_key"){
        throw phoneAlreadyInUseError
    }
    throw error
}

    
}
