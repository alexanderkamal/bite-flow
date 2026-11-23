import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email text NOT NULL UNIQUE,
            phone text NOT NULL UNIQUE,
            name text NOT NULL,
            password_hash text NOT NULL,
            system_role text NOT NULL check (system_role in ('customer', 'restaurant_user','delivery_agent','system_admin')),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP
        );

        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_system_role ON users(system_role);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE users;
    `);
}

