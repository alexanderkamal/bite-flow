import {env} from '../config/env'; // Import the environment variables from the env module, which contains database connection details and other configuration settings.
import type { Knex } from 'knex'; // Import the Knex type for TypeScript type checking and ensuring that the configuration object adheres to the expected structure.

const knexConfig: Knex.Config = {
    client: 'pg',
    connection: {
        host: env.db.DB_HOST,
        port: env.db.DB_PORT,
        user: env.db.DB_USER,
        password: env.db.DB_PASSWORD,
        database: env.db.DB_NAME,
    },
    pool: { max: env.db.DB_POOL_MAX },
    migrations: {
        directory: env.db.DB_MIGRATION_DIR,
        extension: env.db.DB_MIGRATION_EXTENSION,
    },

};

export default knexConfig; // Export the Knex configuration object for use in other parts of the application, such as creating a Knex instance for database operations.