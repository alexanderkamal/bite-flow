import knex from 'knex'; // Import the Knex library for database connection and query building.
import knexConfig from './knexfile'; // Import the Knex configuration object from the knexFile module, which contains the database connection details and other settings.

// the difference between knex and knexConfig is that knex is the instance of the Knex library, while knexConfig is the configuration object that defines how to connect to the database and other settings. The knex instance is created using the knexConfig object, which contains details such as the database client, connection parameters, pool settings, and migration directory.
// the difference between import knex from 'knex' and import type { Knex } from 'knex' (used in knexFile) is that the first one imports the actual Knex library, which is used to create a Knex instance for database operations, while the second one imports only the type definition for Knex, which is used for TypeScript type checking and ensuring that the configuration object adheres to the expected structure. The type import does not include any runtime code and is only used for type checking during development.



export const db = knex(knexConfig); // Export the Knex instance for use in other parts of the application, will be used to connect to the database and perform queries.

export async function pingDB(): Promise<void> { // Function to test the database connection by executing a simple query.
    try {
        await db.raw('SELECT 1 AS result');
        console.log('Database connection successful.');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }   
}