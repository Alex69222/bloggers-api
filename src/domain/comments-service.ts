import {ObjectId} from "mongodb";
import {commentsRepository} from "../repository/comments-repository";
import {transformToPaginationView} from "../helpers/transformToPaginationView";

export type CommentType = {
    _id: ObjectId
    id: number
    postId: number
    content: string
    userId: number
    userLogin: string
    addedAt: Date
}

export const commentsService ={
    async addComment(userId: number, userLogin: string, content: string, postID: number){
        const newComment = {
            _id: new ObjectId(),
            id: +(new Date()),
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
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: number){
        const {commentsCount, comments} = await commentsRepository.getCommentsForSpecifiedPost(PageNumber, PageSize, postId)
        return transformToPaginationView(commentsCount,PageSize, PageNumber, comments)
    },
    async findCommentById(commentId: number): Promise<CommentType | null>{
        return await commentsRepository.getCommentById(commentId)
    },
    async updateComment(commentId: number, content: string):Promise<boolean>{
        return await commentsRepository.updateComment(commentId, content)
    },
    async deleteComment(commentId: number): Promise<boolean>{
        return await commentsRepository.deleteComment(commentId)
    }

}