import { Request, Response, NextFunction } from "express";
import { ICacheProvider } from "../../pkg/cache/cache.interface";
import { container } from "../di/container";
import { TOKENS } from "../di/tokens";

export function withCache(ttlSeconds = 3600, userScoped = false) {
        return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);
            let key = `${req.method}:${req.originalUrl}`;
            if (userScoped) {
                key = `${req.user?.userId}:${key}`; 
            }

            const cachedResponse = await cacheProvider.get(key);
            if (cachedResponse) {
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(JSON.parse(cachedResponse));
            }
            const originalJson = res.json.bind(res); // Store the original res.json method, and bind it to the res object to maintain the correct context.
            // Override res.json to cache the response before sending it
            res.json = (body: any) => {
                if (res.statusCode >= 200 && res.statusCode < 300) { // Only cache successful responses
                    cacheProvider.set(key, JSON.stringify(body), ttlSeconds).catch(() => undefined);
                }
                res.setHeader('X-Cache', 'MISS');
                return originalJson(body);
            };
            next();

        } catch (error) {
            next(error);
        }
    }
}