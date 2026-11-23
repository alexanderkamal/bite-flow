import { CursorPaginationParams, FilterParams } from "./cursor-pagination";

export function parseCursorPaginationQuery
(query: Record<string, any>, allowedSortBy: string[], defaultSortBy: string): CursorPaginationParams {
    const sortBy = allowedSortBy.includes(query.sortBy as string) 
    ? query.sortBy as string : defaultSortBy;
    return {
        cursor: query.cursor as string | undefined,
        limit: Math.min(Number(query.limit) || 8, 8), 
        sortBy: sortBy,
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    };
}



// app.set('query parser', 'extended');
// as we are using query parser extended, we will get the filter params in the following format:
// filter[age][gte]=25&filter[age][lte]=40&filter[status][eq]=active&filter[id][in]=1,2,3
// so we will get the filter params as an object like this:
// filter
// GET /api/users?filter[status][eq]=active&filter[age][gte]=25&filter[age][lte]=40&filter[id][in]=1,2,3
// {
//     filter: {
//         age: { gte: '25', lte: '40' },
//         status: { eq: 'active' },
//        id: { in: '1,2,3' }
//     }
// }
export function parseFilterQuery(query: Record<string, any>, allowedFields: string[]): FilterParams[] {
    const filters = query.filter;
    if (!filters || typeof filters !== 'object') {
        return [];
    }
    const allowedOperators = new Set(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'like']);

    return allowedFields.flatMap(field => {
        const fieldFilters = filters[field];
        if (!fieldFilters || typeof fieldFilters !== 'object') {
            return [];
        }

        return Object.entries(fieldFilters)
            .filter(([operator]) => allowedOperators.has(operator))
            .map(([operator, value]) => ({
                field,
                operator: operator as FilterParams['operator'],
                value: value as string | string[],
            }));
            // TODO: we should validate the value to make sure it's a valid value for the field,
            // as the value might be a string, number, or date, and we should make sure it's a valid value for the field,
            // and if it's not valid, we should throw an error, as the query will fail if the value is not valid for the operator.
            
            // TODO: there is a dfferent approach here, if the operator is not allowed
            // we can just ignore it and not add it to the filters as we done here, 
            // but this might be confusing for the user, as the user might think that the filter is applied,
            // but it's not, so we should throw an error instead.

            // TODO: there is another approach here, if the field is not allowed, we can just ignore it and not add it to the filters as we done here,
            // but this might be confusing for the user, as the user might think that the filter is applied,
            // but it's not, so we should throw an error instead.
    });
    
}
