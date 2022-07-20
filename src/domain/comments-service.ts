import {ObjectId} from "mongodb";
import {commentsRepository} from "../repository/comments-repository";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";

export type CommentType = {
    _id: ObjectId
    postId: string
    content: string
    userId: string
    userLogin: string
    addedAt: Date
}

export const commentsService = {
    async addComment(userId: string, userLogin: string, content: string, postID: string): Promise<Omit<CommentType, '_id' | 'postId'> & {id: string} | null> {
        const newComment = {
            _id: new ObjectId(),
            content,
            userId,
            postId: postID,
            userLogin,
            addedAt: new Date()
        }
        const insertedId = await commentsRepository.addComment(newComment)
        if (!insertedId) return null

        const {_id, postId, ...resultComment} = newComment
        return {
            ...resultComment,
            id: insertedId.toString()
        }

    },
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string): Promise<PaginationType<Omit<CommentType, '_id' | "postId">>> {
        const {
            commentsCount,
            comments
        } = await commentsRepository.getCommentsForSpecifiedPost(PageNumber, PageSize, postId)
        return transformToPaginationView<Omit<CommentType, '_id' | "postId">  & { id: string; }>(commentsCount, PageSize, PageNumber, comments)
    },
    async findCommentById(commentId: string): Promise<Omit<CommentType, '_id' | 'postId'> & { id: string } | null> {
        return await commentsRepository.getCommentById(commentId)
    },
    async updateComment(commentId: string, content: string): Promise<boolean> {
        return await commentsRepository.updateComment(commentId, content)
    },
    async deleteComment(commentId: string): Promise<boolean> {
        return await commentsRepository.deleteComment(commentId)
    }

}