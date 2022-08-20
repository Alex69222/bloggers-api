import 'reflect-metadata'
import {MongoMemoryServer} from "mongodb-memory-server";

import mongoose from "mongoose";
import {PostsRepository} from "../repository/posts-repository";
import {BloggersService} from "./bloggers-service";
import {BloggersRepository} from "../repository/bloggers-repository";
import {PostsLikesRepository} from "../repository/posts-likes-repository";
import {PostsService} from "./posts-service";
jest.setTimeout(100000)

describe("integration test for posts-service", ()=>{

    let mongoServer: MongoMemoryServer
    const bloggersRepository = new BloggersRepository()

    const postsRepository = new PostsRepository()
    const bloggersService = new BloggersService(bloggersRepository)
    const postsLikesRepository = new PostsLikesRepository()

    const postsService = new PostsService(postsRepository,bloggersService,postsLikesRepository)

    beforeAll(async ()=>{
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    afterAll( async ()=>{
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    let bloggerId: string
    const name = 'blogger1'
    const youtubeUrl = "https://www.youtube.com/"


    const title = 'title'
    const shortDescription = 'shortDescription'
    const content = 'content'
    let postId: string
    const userId = 'userId'
    const userLogin = 'userLogin'
    describe("createPost",  ()=>{
        it("should create new post", async()=>{
            const blogger = await bloggersService.createBlogger(name, youtubeUrl)
            bloggerId = blogger!.id



            const result = await  postsService.createPost(title, shortDescription, content, bloggerId)
            postId =  result!.id
            expect(typeof result!.id).toBe('string')
        })
    })

    describe("getPosts", () =>{
        it("should return paginationView with posts", async() =>{
            const res = await postsService.getPosts(1,10, undefined )
            expect(res.totalCount).toBe(1)
            expect(res.items[0].title).toBe(title)
        })
    })

    describe("getPostById", () =>{
        it("should return post by id", async() =>{
            const res = await postsService.getPostById(postId, undefined )
            expect(res!.title).toBe(title)
        })
        it("should not return nonexistent post by id", async() =>{
            const res = await postsService.getPostById(postId + 1, undefined )
            expect(res).toBe(null)
        })
    })
    describe("updatePost", () =>{
        it("should update post by id", async() =>{
            const res = await postsService.updatePost(title + 1, shortDescription + 1, content + 1, bloggerId, postId)
            expect(res).toBeTruthy()
        })
        it("should not update nonexistent post by id", async() =>{
            const res = await postsService.updatePost(title + 1, shortDescription + 1, content + 1, bloggerId, postId + 1)
            expect(res).toBeFalsy()
        })
    })

    describe("setPostLikeStatus", () =>{
        it("should set post status to Like", async() =>{
            await postsService.setPostLikeStatus( postId, userId, userLogin, 'Like')
            const res = await postsService.getPostById(postId, userId)
            expect(res!.extendedLikesInfo.likesCount).toBe(1)
            expect(res!.extendedLikesInfo.myStatus).toBe("Like")
        })
        it("should set comment status to 'Dislike'", async() =>{
            await postsService.setPostLikeStatus( postId, userId, userLogin, 'Dislike')
            const res = await postsService.getPostById(postId, userId)
            expect(res!.extendedLikesInfo.likesCount).toBe(0)
            expect(res!.extendedLikesInfo.dislikesCount).toBe(1)
            expect(res!.extendedLikesInfo.myStatus).toBe("Dislike")
        })
        it("should set comment status to 'None'", async() =>{
            await postsService.setPostLikeStatus( postId, userId, userLogin, 'None')
            const res = await postsService.getPostById(postId, userId)
            expect(res!.extendedLikesInfo.likesCount).toBe(0)
            expect(res!.extendedLikesInfo.dislikesCount).toBe(0)
            expect(res!.extendedLikesInfo.myStatus).toBe("None")
        })
    })
})