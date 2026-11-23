import express from "express";
import {logger} from "./lib/logger/logger.js";
import {routes} from "./routes.js";
import {correlationId} from "./lib/correlation/correlationId.js";
import {errorHandler} from "./lib/error/errorHandler.js";
import cookieParser from 'cookie-parser';
import { env } from "./lib/config/env.js";
import cors from "cors";
import helmet from "helmet";

// localhost:3000/api/
export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(cors({origin: env.cors.origins, credentials: true}));
    app.set('query parser', 'extended');
    app.use(express.json());
    app.use(cookieParser());
    app.use(correlationId);
    app.use('/api', routes)
    app.use(errorHandler);
    return app;
}
