import {ObjectId} from "mongodb";
import {commentsRepository} from "../repository/comments-repository";
import {transformToPaginationView} from "../helpers/transformToPaginationView";

export type CommentType = {
    _id: ObjectId
    id: string
    postId: string
    content: string
    userId: string
    userLogin: string
    addedAt: Date
}

export const commentsService ={
    async addComment(userId: string, userLogin: string, content: string, postID: string){
        const newComment = {
            _id: new ObjectId(),
            id: Number(new Date()).toString(),
            content,
            userId,
            postId: postID,
            userLogin,
            addedAt: new Date()
        }
        await commentsRepository.addComment(newComment)
        const {_id, postId, ...resultComment} = newComment
        return resultComment
    },
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string){
        const {commentsCount, comments} = await commentsRepository.getCommentsForSpecifiedPost(PageNumber, PageSize, postId)
        return transformToPaginationView(commentsCount,PageSize, PageNumber, comments)
    },
    async findCommentById(commentId: string): Promise<CommentType | null>{
        return await commentsRepository.getCommentById(commentId)
    },
    async updateComment(commentId: string, content: string):Promise<boolean>{
        return await commentsRepository.updateComment(commentId, content)
    },
    async deleteComment(commentId: string): Promise<boolean>{
        return await commentsRepository.deleteComment(commentId)
    }

}