import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE customer_addresses (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            label TEXT not NULL,
            country TEXT not NULL,
            city TEXT not NULL,
            street TEXT not NULL,
            type TEXT not NULL check (type in ('office', 'home', 'public_place')),
            building TEXT,
            floor_number TEXT,
            apartment_number TEXT,
            latitude decimal(10, 7) not NULL,
            longitude decimal(10, 7) not NULL,
            is_default BOOLEAN NOT NULL DEFAULT false,
            
            CONSTRAINT fk_customer_addresses_user_id FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX idx_customer_addresses_user_id ON Customer_addresses(user_id);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE customer_addresses;
    `);
}

