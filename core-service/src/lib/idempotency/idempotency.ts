import {Request, Response, NextFunction} from "express";
import {ICacheProvider} from "../../pkg/cache/cache.interface";
import {container} from "../di/container";
import {TOKENS} from "../di/tokens";
import {toSeconds} from "../../pkg/utils/time";

// TODO: this code is not production ready, it is just for learning how to make idempotency middlware
// there is gaps here that I am aware of and it needs many adjustements. 
// I will use it in this service just for password reset, so it is not a big deal like orders and payments.
// so it will be implemented in a better way in the orders and payments service.
// once finished there I will put it here.

const TTL = toSeconds(1, 'd');

interface IdempotencyOptions {
    strict?: boolean;
}

export function idempotency(options: IdempotencyOptions = {}) {
    const {strict = false} = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        if (!["POST", "PATCH", "PUT"].includes(req.method)) {
            return next();
        }

        const idempotencyKey: string | undefined = req.headers["idempotency-key"] as string | undefined;

        if (!idempotencyKey) {
            if (strict) {
                return res.status(400).json({
                    error: "Missing Idempotency-Key header",
                });
            }
            return next();
        }

        try {
            const cacheProvider: ICacheProvider = container.resolve(TOKENS.CacheProvider);
            const key = `idempotency:${req.method}:${req.originalUrl}:${idempotencyKey}`;

            const cached = await cacheProvider.get(key);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }

            const originalJson = res.json.bind(res);

            res.json = ((body: any) => {
                cacheProvider.set(key, JSON.stringify(body), TTL);
                return originalJson(body);
            });

            next();
        } catch {
            if (strict) {
                return res.status(503).json({
                    error: "Idempotency service unavailable",
                });
            }
            next();
        }
    };
}
