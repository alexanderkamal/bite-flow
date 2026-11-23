import Redis from "ioredis";
import { ICacheProvider } from "./cache.interface";

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}

export class RedisCacheProvider implements ICacheProvider {
    private readonly client: Redis; // ioredis client instance, this is the actual connection to the redis server, we will use this client to interact with the redis server
    constructor(private readonly config: RedisConfig) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            password: config.password,
            lazyConnect: true, // don't connect until we need to, this line is important because we don't want to connect to redis until we actually need to use it
            maxRetriesPerRequest: 3
        });
        this.client.on("error", (err) => {console.error("Redis error:", err.message);}); // listen for redis errors and log them, we don't want to crash the application if redis is down
        this.client.connect().catch((err) => {console.error("Redis connection error:", err.message);}); // connect to redis server, if it fails, log the error and continue, we don't want to crash the application if redis is down
    }
    
    async set(key: string, value: any, ttlSeconds?: number): Promise<any> {
        if (ttlSeconds) {
            await this.client.set(key, value, "EX", ttlSeconds); // EX sets the expiration time in seconds, this is important because we don't want to keep stale data in redis, we want to expire it after a certain amount of time
        } else {
            await this.client.set(key, value); // if no ttl is provided, we will set the value without expiration
        }
    }

    async get(key: string): Promise<any> {
        return this.client.get(key);
    }
    
    async del(key: string): Promise<any> {
        return this.client.del(key);
    }
}