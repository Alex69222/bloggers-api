
export const transformToPaginationView = (itemsCount: number, PageSize: number, PageNumber: number, items: Array<any> ) =>{
    return {
        "pagesCount": Math.ceil(itemsCount / PageSize),
        "page": PageNumber,
        pageSize: PageSize,
        "totalCount": itemsCount,
        items
    }
}