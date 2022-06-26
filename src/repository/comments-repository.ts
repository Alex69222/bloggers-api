import {CommentType} from "../domain/comments-service";
import {commentsCollection} from "./db";

export const commentsRepository = {
    async addComment(newComment: CommentType) {
        await commentsCollection.insertOne(newComment)
    },
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string) {
        const commentsCount = await commentsCollection.count({postId})
        const comments = await commentsCollection.find({postId})
            .project({_id: 0, postId: 0})
            .skip((PageNumber - 1) * PageSize)
            .limit(PageSize)
            .toArray()
        return {
            commentsCount,
            comments
        }
    },
    async getCommentById(commentId: string): Promise<CommentType | null> {
        return await commentsCollection.findOne({id: commentId}, {projection: {_id: 0, postId: 0}})
    },
    async updateComment(commentId: string, content: string):Promise<boolean>{
        const result = await commentsCollection.updateOne({id: commentId}, {$set: {content}})
        return result.matchedCount === 1
    },
    async deleteComment(commentId: string): Promise<boolean>{
        const result = await commentsCollection.deleteOne({id: commentId})
        return result.deletedCount === 1
    }
}