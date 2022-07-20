import {CommentType} from "../domain/comments-service";
import {commentsCollection} from "./db";
import {ObjectId} from "mongodb";

export const commentsRepository = {
    async addComment(newComment: CommentType): Promise<ObjectId | null> {
        const result = await commentsCollection.insertOne(newComment)
        return result.insertedId || null
    },
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string): Promise<{ commentsCount: number, comments: (Omit<CommentType, '_id' | 'postId'> & { id: string })[] }> {
        const commentsCount = await commentsCollection.count({postId})
        const comments = await commentsCollection.aggregate<Omit<CommentType, '_id' | 'postId'> & { id: string }>([
            {"$match": {postId}},
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0, "postId": 0}},
            {"$skip": (PageNumber - 1) * PageSize},
            {"$limit": PageSize}
        ]).toArray()
        return {
            commentsCount,
            comments
        }
    },
    async getCommentById(commentId: string): Promise<Omit<CommentType, '_id' | 'postId'> & { id: string } | null> {
        if (!ObjectId.isValid(commentId)) return null
        const postsArr = await commentsCollection.aggregate<Omit<CommentType, '_id' | 'postId'> & {id: string}>([
            {"$match": {"_id": new ObjectId(commentId)}},
            {"$addFields": {"id": {$toString: "$_id"}}},
            {"$project": {"_id": 0}}
        ]).toArray()

        return postsArr[0] || null
    },
    async updateComment(commentId: string, content: string): Promise<boolean> {
        if(!ObjectId.isValid(commentId)) return false
        const result = await commentsCollection.updateOne({_id: new ObjectId(commentId)}, {$set: {content}})
        return result.matchedCount === 1
    },
    async deleteComment(commentId: string): Promise<boolean> {
        if(!ObjectId.isValid(commentId)) return false
        const result = await commentsCollection.deleteOne({_id: new ObjectId(commentId)})
        return result.deletedCount === 1
    }
}