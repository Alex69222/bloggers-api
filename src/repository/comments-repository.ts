import {CommentType} from "../domain/comments-service";
import {CommentModelClass, commentsCollection, PostModelClass} from "./db";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {idMapper} from "../helpers/id-mapper";

@injectable()
export class  CommentsRepository{
    async addComment(newComment: CommentType): Promise<ObjectId | null> {
        try{
            const commentInstance = new CommentModelClass(newComment)
            await commentInstance.save()
            return commentInstance._id
            console.log('added')
        }catch (e){
            return null
        }
    }
    async getCommentsForSpecifiedPost(PageNumber: number, PageSize: number, postId: string, userId: string | undefined): Promise<{ commentsCount: number, comments: (Omit<CommentType, '_id' | 'postId'> & { id: string })[] }> {
        const commentsCount = await CommentModelClass.count({postId})
        const dbComments = await CommentModelClass.find({postId}, {postId: 0}).skip(((PageNumber - 1) * PageSize)).limit(PageSize).lean()
        const comments = idMapper(dbComments)
        comments.forEach((p: any) => {
            if (userId) {
                const userLikeStatus = p.totalInfo.find((el: { userId: string; }) => el.userId === userId) || null
                if (userLikeStatus) {
                    p.likesInfo.myStatus = userLikeStatus.likeStatus
                }
            }

            delete p.totalInfo
        })
        return {
            commentsCount,
            comments
        }
    }
    async getCommentById(commentId: string, userId: string | undefined): Promise<Omit<CommentType, '_id' | 'postId'> & { id: string } | null> {
        if (!ObjectId.isValid(commentId)) return null
        const dbComment = await CommentModelClass.findById(new ObjectId(commentId), {postId: 0}).lean()
        if(!dbComment) return null
        const comment = idMapper(dbComment)
        if (userId) {
            const userLikeStatus = comment.totalInfo.find((el: { userId: string; }) => el.userId === userId)
            if (userLikeStatus) {
                comment.likesInfo.myStatus = userLikeStatus.likeStatus
            }
        }
        delete comment.totalInfo
        return comment
    }
    async updateComment(commentId: string, content: string): Promise<boolean> {
        if(!ObjectId.isValid(commentId)) return false

        const updateResult = await CommentModelClass.findByIdAndUpdate(new ObjectId(commentId), {content})
        if(!updateResult) return false
        return true
    }
    async deleteComment(commentId: string): Promise<boolean> {
        if(!ObjectId.isValid(commentId)) return false

        const deleteResult = await CommentModelClass.findByIdAndDelete(new ObjectId(commentId))
        if(!deleteResult) return false
        return true
    }
    async addLike(commentId: string, userId: string, login: string, likeStatus: string): Promise<boolean> {
        if (!ObjectId.isValid(commentId)) return false
        const comment = await CommentModelClass.findById(new ObjectId(commentId))
        if (!comment) return false


        const currentUserLikeStatus = comment.totalInfo.find(s => s.userId === userId)

        if (!currentUserLikeStatus) {
            if (likeStatus === "Like") {
                comment.likesInfo.likesCount++
            } else if (likeStatus === "Dislike") {
                comment.likesInfo.dislikesCount++
            }

        } else {

            if (currentUserLikeStatus.likeStatus === "Like" && likeStatus !== "Like") {
                comment.likesInfo.likesCount--
            } else if (currentUserLikeStatus.likeStatus !== "Like" && likeStatus === "Like") {
                comment.likesInfo.likesCount++
            }

            if (currentUserLikeStatus.likeStatus === "Dislike" && likeStatus !== "Dislike") {
                comment.likesInfo.dislikesCount--
            } else if (currentUserLikeStatus.likeStatus !== "Dislike" && likeStatus === "Dislike") {
                comment.likesInfo.dislikesCount++
            }

            const currentIndex = comment.totalInfo.indexOf(currentUserLikeStatus)
            comment.totalInfo.splice(currentIndex, 1)
        }

        comment.totalInfo.push({
            addedAt: new Date(),
            userId,
            login,
            likeStatus
        })


        await comment.save()
        return true
    }
}
// export const commentsRepository = new CommentsRepository()