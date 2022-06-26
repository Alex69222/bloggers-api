
export const pagePropsHandler = (PageNumber: unknown, PageSize: unknown):[number, number] =>{
    return [Number(PageNumber) || 1, Number(PageSize) || 10]
}

// let x:number = 0
//
// let y: unknown = 's'
//
// x = y
