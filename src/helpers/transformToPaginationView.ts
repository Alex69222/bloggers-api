export type PaginationType<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: Array<T>
}
export const transformToPaginationView =
    <T>(itemsCount: number, PageSize: number, PageNumber: number, items: Array<T>): PaginationType<T> => {
        return {
            "pagesCount": Math.ceil(itemsCount / PageSize),
            "page": PageNumber,
            pageSize: PageSize,
            "totalCount": itemsCount,
            items
        }
    }