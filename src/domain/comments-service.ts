import {ObjectId} from "mongodb";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {CommentsRepository} from "../repository/comments-repository";
import {inject, injectable} from "inversify";

export type CommentType = {
    _id: ObjectId
    postId: string
    content: string
    userId: string
    userLogin: string
    addedAt: Date
    likesInfo: {
        likesCount: number
        dislikesCount: number,
        myStatus: string
    }
    totalInfo:Array<{
        addedAt: Date
        userId: string
        login: string
        likeStatus: string
    }>
}

@injectable()
export class CommentsService{
    constructor(
        @inject(CommentsRepository) protected commentsRepository: CommentsRepository
    ) {
    }
    async addComment(userId: string, userLogin: string, content: string, postID: string): Promise<Omit<CommentType, '_id' | 'postId' | 'totalInfo'> & {id: string} | null> {
        const newComment = {
            _id: new ObjectId(),
            content,
            userId,
            postId: postID,
            userLogin,
            addedAt: new Date(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            },
            totalInfo:[]
        }
        const insertedId = await this.commentsRepository.addComment(newComment)
        if (!insertedId) return null

        const {_id, postId, totalInfo, ...resultComment} = newComment
        return {
            ...resultComment,
            id: insertedId.toString()
        }

    }
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string , userId: string | undefined): Promise<PaginationType<Omit<CommentType, '_id' | "postId">>> {
        const {
            commentsCount,
            comments
        } = await this.commentsRepository.getCommentsForSpecifiedPost(PageNumber, PageSize, postId, userId)
        return transformToPaginationView<Omit<CommentType, '_id' | "postId">  & { id: string; }>(commentsCount, PageSize, PageNumber, comments)
    }
    async findCommentById(commentId: string, userId: string | undefined): Promise<Omit<CommentType, '_id' | 'postId'> & { id: string } | null> {
        return await this.commentsRepository.getCommentById(commentId, userId)
    }
    async updateComment(commentId: string, content: string): Promise<boolean> {
        return await this.commentsRepository.updateComment(commentId, content)
    }
    async deleteComment(commentId: string): Promise<boolean> {
        return await this.commentsRepository.deleteComment(commentId)
    }
    async setCommentLikeStatus(commentId: string, userId: string, userLogin: string, likeStatus: string){
        const likeIsAddedToPost = await this.commentsRepository.addLike(commentId, userId, userLogin, likeStatus)
        if(!likeIsAddedToPost) return false
    }
}
// export const commentsService = new CommentsService()