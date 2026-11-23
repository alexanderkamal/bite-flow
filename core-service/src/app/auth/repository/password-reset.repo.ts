import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { PasswordReset } from "../entity/password-reset.entity";

const PASSWORD_RESET_COLUMNS = ["id", "user_id", "otp_hash", "expires_at", "consumed_at", "created_at"];

function mapRowToPasswordReset(row: any): PasswordReset {
    return new PasswordReset({
        id: row.id,
        userId: row.user_id,
        otpHash: row.otp_hash,
        expiresAt: row.expires_at,
        consumedAt: row.consumed_at ?? null,
        createdAt: row.created_at
    });
}

function mapPasswordResetToRow(passwordReset: Partial<PasswordReset>): any {
    return {
        user_id: passwordReset.userId,
        otp_hash: passwordReset.otpHash,
        expires_at: passwordReset.expiresAt,
        created_at: passwordReset.createdAt
    };
}

export async function createPasswordReset(passwordReset: Partial<PasswordReset>, conn?:Knex.Transaction) : Promise<void> {
    const query = conn || db;
    await query("password_resets").insert(mapPasswordResetToRow(passwordReset));
}

export async function findLatestPasswordResetByUserId(userId: number): Promise<PasswordReset | null> {
    const row = await db("password_resets")
        .select(PASSWORD_RESET_COLUMNS)
        .where("user_id", userId)
        .whereNull("consumed_at")
        .orderBy("id", "desc")
        .first();

    return row ? mapRowToPasswordReset(row) : null;
}

export async function updatePasswordResetConsumedAt(id: number): Promise<void> {
    await db("password_resets")
        .where("id", id)
        .update({ consumed_at: new Date() });
}






