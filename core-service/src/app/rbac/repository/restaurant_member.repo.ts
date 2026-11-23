import {Knex} from "knex";
import {db} from "../../../lib/knex/knex";
import {RestaurantMember} from "../entity/restaurant-member.entity";
import {MemberStatus} from "../enums";

const MEMBER_COLUMNS = ['id','restaurant_id','user_id','role_id','status','created_at','updated_at'];

function toEntity(row:any) {
    return new RestaurantMember({
        id: row.id,
        restaurantId: row.restaurant_id,
        userId: row.user_id,
        roleId: row.role_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    })
}

export async function createRestaurantMember(data: Partial<RestaurantMember>, conn: Knex = db): Promise<RestaurantMember> {
    const query = conn || db;
    const [row] = await query("restaurant_members").insert({
        restaurant_id: data.restaurantId,
        user_id: data.userId,
        role_id: data.roleId,
        status: data.status,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
    }).returning(MEMBER_COLUMNS);
    return toEntity(row);
}

export async function activateMemberByUserId(userId:number, conn: Knex = db): Promise<void> {
    const query = conn || db;
    await query("restaurant_members").where("user_id", userId).update(
        {status: MemberStatus.ACTIVE,
        updated_at: new Date()}
    )
}

export async function findMemberWithRoleNameByUserId(userId: number, conn: Knex = db) {
    const row = await conn("restaurant_members as rm").select(
        "rm.restaurant_id",
        "rm.id",
        "r.name as roleName"
    ).leftJoin("roles as r","rm.role_id","r.id")
        .where("rm.user_id", userId)
        .andWhere("rm.status",MemberStatus.ACTIVE).first();
    return row? {
        member: toEntity(row),
        roleName: row.roleName,
    } : null;
}

export async function findMembersByRestaurantId(restaurantId: number)  {
    const rows = await db("restaurant_members as rm").select(
        "rm.id as memberId",
        "u.id as userId",
        "u.email as email",
        "u.name as name",
        "u.phone as phone",
        "r.name as roleName",
        "r.display_name as roleDisplayName",
        "rm.status as status",
        "rm.created_at as createdAt",
        "rm.updated_at as updatedAt"
    ).leftJoin("users as u","rm.user_id","u.id")
        .leftJoin("roles as r","rm.role_id","r.id")
        .where("rm.restaurant_id", restaurantId)
    return rows;
}

export async function findMemberWithRoleName(memberId: number, conn: Knex = db) {
    const row = await conn("restaurant_members as rm").select(
        ...MEMBER_COLUMNS.map(col => `rm.${col}`),
        "r.name as roleName"
    ).join("roles as r","rm.role_id","r.id")
        .where("rm.id", memberId)
        .first();
    return row ? {member: toEntity(row), roleName: row.roleName} : null;
}

export async function updateMember(memberId: number, data: {roleId?: number, status?: string}, conn: Knex = db) {
    const updateData = {
        role_id: data.roleId,
        status: data.status,
        updated_at: new Date()
    }
    const rows = await conn("restaurant_members").where("id", memberId).update(updateData).returning(MEMBER_COLUMNS);
    return rows ? toEntity(rows[0]) : null;
}

export async function deleteMember(memberId: number, conn: Knex = db) {
    await conn("member_branches").where("member_id", memberId).del(); // actually there is no need for this as there's ON DELETE CASCADE
    await conn("restaurant_members").where("id", memberId).del();
}