import { config } from "dotenv";
import z from "zod";
import path from "path";
import type { StringValue } from "ms";


config({path: path.resolve(__dirname, '../../../.env')}); // Load environment variables from .env file. through process.env
// __dirname is used to get the directory name of the current module file. This is necessary because the .env file is located in the root directory of the project, and we need to provide the correct path to the config function.


const envSchema  = z.object({
    PORT: z.string().default("3000"),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.string().default("5432"),
    DB_USER: z.string().default("postgres"),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_POOL_MAX: z.string().default("10"),
    DB_MIGRATION_DIR: z.string().default("src/migrations"),
    DB_MIGRATION_EXTENSION: z.string().default(""),
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("1H") as z.ZodType<StringValue>,
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d") as z.ZodType<StringValue>,
    NODE_ENV: z.string().default("development"),
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    REDIS_PASSWORD: z.string().default(""),
    MAILJET_API_KEY: z.string(),
    MAILJET_SECRET_KEY: z.string(),
    MAILJET_FROM_EMAIL: z.string(),
    MAILJET_FROM_NAME: z.string()
});

const parsedEnv = envSchema.parse(process.env); // we are able to use process.env because we have already loaded the environment variables from the .env file using dotenv.config().

export const env = {
    PORT: Number(parsedEnv.PORT),
    db: {
    DB_HOST: parsedEnv.DB_HOST,
    DB_PORT: Number(parsedEnv.DB_PORT),
    DB_USER: parsedEnv.DB_USER,
    DB_PASSWORD: parsedEnv.DB_PASSWORD,
    DB_NAME: parsedEnv.DB_NAME,
    DB_POOL_MAX: Number(parsedEnv.DB_POOL_MAX),
    
    DB_MIGRATION_DIR: path.resolve(__dirname,"../../../", parsedEnv.DB_MIGRATION_DIR),
    DB_MIGRATION_EXTENSION: parsedEnv.DB_MIGRATION_EXTENSION,
    },
    jwt: {
        ACCESS_TOKEN_SECRET: parsedEnv.ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN: parsedEnv.ACCESS_TOKEN_EXPIRES_IN,
        REFRESH_TOKEN_SECRET: parsedEnv.REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRES_IN: parsedEnv.REFRESH_TOKEN_EXPIRES_IN,
    },

    NODE_ENV: parsedEnv.NODE_ENV,
    isProduction: parsedEnv.NODE_ENV == "production",

    cors: {
        origins: parsedEnv.CORS_ORIGINS.split(','),
    },
    // redis
    redis: {
        host: parsedEnv.REDIS_HOST,
        port: Number(parsedEnv.REDIS_PORT),
        password: parsedEnv.REDIS_PASSWORD,
    },

    mailjet: {
        apiKey: parsedEnv.MAILJET_API_KEY,
        secretKey: parsedEnv.MAILJET_SECRET_KEY,
        fromEmail: parsedEnv.MAILJET_FROM_EMAIL,
        fromName: parsedEnv.MAILJET_FROM_NAME,
    }




}