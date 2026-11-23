declare namespace Express {
    interface Request {
        user?: {
            userId: number;
            email: string;
            systemRole: string;
            // for restaurant users only
            restaurantId?: number;
            restaurantRole?: string;
            branchIds?: number[];
        };

        correlationId?: string;
    }
}