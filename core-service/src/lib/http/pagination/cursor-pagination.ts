import { Knex } from "knex";

export interface CursorPaginationParams {
    cursor?: string;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface CursorPaginationMetaResponse {
    nextCursor: string | null;
    hasNextPage: boolean;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like';
    value: string | string[];
}

function camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function applyCursorPagination(query: Knex.QueryBuilder, params: CursorPaginationParams): Knex.QueryBuilder {
    if (!params.sortBy){
        // this might change, but for now, we will just return the query as is if sortBy is not provided.. 
        // but I think there should be a default sortBy column, and if not provided, we should use that default column to sort by
        // also there should be a column like 'id' to sort by it even if the user doesn't provide it as a sortBy column, 
        // as for created_at for example there might be multiple rows with the same created_at value, 
        // and in this case we might miss some rows between the cursor and the next page, 
        // so we should have a default sortBy column like 'id' to sort by it even if the user doesn't provide it as a sortBy column.
        // this might be also configured from the service itself as some tables might don't have an 'id' column, 
        // so we should have a default sortBy column for each table, and if the user doesn't provide it, 
        // we should use that default column to sort by. even it's provided or not.

        // TODO: we should add a default sortBy column for each table (unique column), 
        // and if the user doesn't provide it, we should use that default column to sort by.
        // and if user provides something else, we should use both.
        return query;
    }
    if (params.cursor) {
        const op = params.sortOrder === 'desc' ? '<' : '>';
        query = query.where(camelToSnakeCase(params.sortBy), op, params.cursor);
        // TODO: we should validate the cursor value to make sure it's a valid value for the sortBy column,
        // as the cursor value might be a string, number, or date, and we should make sure it's a valid value for the sortBy column,
        // and if it's not valid, we should throw an error, as the query will fail if the cursor value is not valid for the sortBy column.
    }
    query = query.orderBy(camelToSnakeCase(params.sortBy), params.sortOrder).limit(params.limit + 1); // +1 to check if there is a next page
    return query;
}


export function applyFilters(query: Knex.QueryBuilder, filters: FilterParams[]): Knex.QueryBuilder {
    
    filters.forEach(filter => {;
        switch (filter.operator) {
            case 'eq': query = query.where(camelToSnakeCase(filter.field), filter.value); break;
            case 'ne': query = query.whereNot(camelToSnakeCase(filter.field), filter.value); break;
            case 'gt': query = query.where(camelToSnakeCase(filter.field), '>', filter.value); break;
            case 'lt': query = query.where(camelToSnakeCase(filter.field), '<', filter.value); break;
            case 'gte': query = query.where(camelToSnakeCase(filter.field), '>=', filter.value); break;
            case 'lte': query = query.where(camelToSnakeCase(filter.field), '<=', filter.value); break;
            case 'like': query = query.whereLike(camelToSnakeCase(filter.field), `%${filter.value}%`);break; 
            case 'in': query = query.whereIn(camelToSnakeCase(filter.field), Array.isArray(filter.value) ? filter.value : [filter.value]);break;
        }
    });
    return query;
}

export function buildCursorPaginationResponse<T>(rows: T[], limit: number, sortBy: string, sortOrder: 'asc' | 'desc'):{data: T[], meta: CursorPaginationMetaResponse} {
    
    const hasNextPage = rows.length > limit;
    const data = hasNextPage ? rows.slice(0, limit) : rows;
    let nextCursor: string | null = null;

    if (data.length > 0) {
        const lastRow = data[data.length - 1] as any; 
        // we are using any here because we don't know the type of the row, 
        // and we need to access the sortBy field dynamically
        nextCursor = hasNextPage && lastRow ? lastRow[sortBy] instanceof Date ? lastRow[sortBy].toISOString() : String(lastRow[sortBy]) : null;
        // TODO:we should make sure that we are using same timezones in db and in the code, 
        // as we are using toISOString() here, and in the db we might be using different timezone, 
        // so we should make sure that we are using same timezone in both places.
    }
    return { data, 
        meta: {
             hasNextPage, 
             nextCursor, 
             pageSize: data.length, 
             sortBy, 
             sortOrder } };
}