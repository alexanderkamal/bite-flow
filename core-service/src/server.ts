import "reflect-metadata"
import http from 'http';
import { createApp } from './app';
import { env } from './lib/config/env';
import { db } from './lib/knex/knex';


const app = createApp();
const server = http.createServer(app);
server.listen(env.PORT, () => {
    try {
        console.log(`Server is running on port ${env.PORT}`);
    } catch (error) {
        console.error('Error starting server:', error);
    }
})


async function shutdown() {
    console.log('Shutting down server...');
    server.close(async () => {
        try {
            await db.destroy();
            console.log('Database connection closed.');
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
        process.exit(0);
    });
}

process.on('SIGINT', shutdown); // Handle Ctrl+C signal for graceful shutdown
process.on('SIGTERM', shutdown); // Handle termination signal for graceful shutdown, e.g. when running in a containerized environment
