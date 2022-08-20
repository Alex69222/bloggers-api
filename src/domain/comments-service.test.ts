import 'reflect-metadata'
import {MongoMemoryServer} from "mongodb-memory-server";
import {CommentsRepository} from "../repository/comments-repository";
import {CommentsService} from "./comments-service";
import mongoose from "mongoose";
jest.setTimeout(100000)

describe("integration test for comments-service", ()=>{
    let mongoServer: MongoMemoryServer
    const commentsRepository = new CommentsRepository()
    const commentsService = new CommentsService(commentsRepository)
    beforeAll(async ()=>{
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    afterAll( async ()=>{
        await mongoose.disconnect()
        await mongoServer.stop()
    })
    const userId = 'userId'
    const userLogin = 'userLogin'
    const commentContent = 'commentContent'
    const postId = 'postId'
    let commentId: string
    describe("addComment", ()=>{
        it("should add comment", async ()=>{
           const result = await commentsService.addComment( userId, userLogin, commentContent, postId)
            expect(result!.userLogin).toBe('userLogin')

        })
    })
    describe('getCommentsForSpecifiedPost', ()=>{
        it("should get comments for specified post", async ()=>{
            const result = await commentsService.getCommentsForSpecifiedPost(1,10,postId, userId)

            expect(result.totalCount).toBe(1)
            expect(result.items[0].content).toBe(commentContent)
            commentId = result.items[0].id
        })
    })
    describe("findCommentById", ()=>{
        it("should find comment by id", async ()=>{
            const result = await commentsService.findCommentById(commentId)
            expect(result!.content).toBe(commentContent)
        })
        it("should not find nonexistent comment by id", async ()=>{
            const result = await commentsService.findCommentById(commentId + 1)
            expect(result).toBe(null)
        })
    })
    describe("updateComment", ()=>{
        it("should update comment by id", async ()=>{
            const result = await commentsService.updateComment(commentId, commentContent + 111)
            expect(result).toBeTruthy()
        })
        it("should not update nonexistent comment by id", async ()=>{
            const result = await commentsService.findCommentById(commentId + 1, commentContent + 111)
            expect(result).toBeFalsy()
        })
    })
    describe("setCommentLikeStatus", ()=>{
        it("should set comment status to 'Like'", async ()=>{
            await commentsService.setCommentLikeStatus(commentId,userId,userLogin, 'Like')
            const result = await commentsService.findCommentById(commentId, userId)
            expect(result!.likesInfo.likesCount).toBe(1)
            expect(result!.likesInfo.myStatus).toBe("Like")
        })
        it("should set comment status to 'Dislike'", async ()=>{
            await commentsService.setCommentLikeStatus(commentId,userId,userLogin, 'Dislike')
            const result = await commentsService.findCommentById(commentId, userId)
            expect(result!.likesInfo.likesCount).toBe(0)
            expect(result!.likesInfo.dislikesCount).toBe(1)
            expect(result!.likesInfo.myStatus).toBe('Dislike')
        })
        it("should set comment status to 'None'", async ()=>{
            await commentsService.setCommentLikeStatus(commentId,userId,userLogin, 'None')
            const result = await commentsService.findCommentById(commentId, userId)
            expect(result!.likesInfo.likesCount).toBe(0)
            expect(result!.likesInfo.dislikesCount).toBe(0)
            expect(result!.likesInfo.myStatus).toBe('None')
        })
    })
    describe("deleteComment", ()=>{
        it("should delete comment by id", async ()=>{
            const result = await commentsService.deleteComment(commentId)
            expect(result).toBeTruthy()
        })
        it("should not delete nonexistent comment by id", async ()=>{
            const result = await commentsService.deleteComment(commentId)
            expect(result).toBeFalsy()
        })
    })

})
