export enum LIKES {
    LIKE = "Like",
    DISLIKE = "Dislike",
    NONE = "None"
}
export type  PaginationQueryType = {
    PageNumber: string
    PageSize: string
}

export type Likes = Array<{
    [index: string]: {
        [userId: string]: {
            likeStatus: LIKES
        }
    }
}>