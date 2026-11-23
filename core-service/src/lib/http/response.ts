import { Response } from "express";
import { CursorPaginationMetaResponse } from "./pagination/cursor-pagination";

export interface ApiResponse <T> {
    success: boolean,
    data?: T,
    meta?: Object
}



export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Object){
    const body: ApiResponse<T> = {success: true, data: data}
    if (meta) {
        body.meta = meta
    }
    res.status(statusCode).json(body)
}

export function sendPaginationResponse<T>(res: Response, data: T[], meta: CursorPaginationMetaResponse, statusCode = 200){
    res.status(statusCode).json({
        success: true,
        data: data,
        meta: meta
    })
}