import 'reflect-metadata'
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {BloggersService} from "./bloggers-service";
import {BloggersRepository} from "../repository/bloggers-repository";
jest.setTimeout(100000)
describe("integration tests for bloggersService", ()=>{
    let mongoServer: MongoMemoryServer
    const bloggersRepository = new BloggersRepository()
    const bloggersService = new BloggersService(bloggersRepository)
    beforeAll(async ()=>{
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()
        await mongoose.connect(mongoUri)
    })
    afterAll( async ()=>{
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    let id: string
    const name = 'blogger1'
    const youtubeUrl = "https://www.youtube.com/"
    describe("create blogger", ()=>{

        it("should return id, name and youtubeUrl of created blogger", async ()=>{


            const result = await bloggersService.createBlogger(name, youtubeUrl)
            id = result!.id
            expect(result!.name).toBe(name)
            expect(result!.youtubeUrl).toBe(youtubeUrl)
        })
    })
    describe("update blogger", ()=>{
        it("should update existing blogger", async ()=>{
            const result = await bloggersService.updateBlogger(id, name + 1, youtubeUrl + 1)
            expect(result).toBeTruthy()
        })
        it("should not update unexsistent user", async ()=>{
            const result = await bloggersService.updateBlogger(id + 1, name + 1, youtubeUrl + 1)
            expect(result).toBeFalsy()
        })
    })
    describe("getBloggerById",  ()=>{
        it("should return blogger by id", async ()=>{
            const result = await bloggersService.getBloggerById(id)
            expect(result!.name).toBe(name + 1)
            expect(result!.youtubeUrl).toBe(youtubeUrl + 1)
        })
        it("should not return nonexistent blogger by id", async ()=>{
            const result = await bloggersService.getBloggerById(id + 1)
            expect(result).toBe(null)
        })
    })
    describe("getBloggers", ()=>{
        it("should return paginationView with 1 blogger", async ()=>{
            const result = await bloggersService.getBloggers('', 1, 10)
            expect(result.pagesCount).toBe(1)
            expect(result.page).toBe(1)
            expect(result.totalCount).toBe(1)
            expect(result.items[0].name).toBe(name + 1)
            expect(result.items[0].youtubeUrl).toBe(youtubeUrl + 1)
        })
    })
    describe("getBloggersPosts", ()=>{
        it("should return pagination view with no posts of a blogger", async ()=>{
            const result = await bloggersService.getBloggerPosts(1, 10, id, undefined)
            expect(result.pagesCount).toBe(0)
            expect(result.page).toBe(1)
            expect(result.totalCount).toBe(0)
        })
    })
    describe("deleteBlogger", ()=>{
        it("should delete blogger by id", async ()=>{
            const result = await bloggersService.deleteBlogger(id)
            const allBloggers = await bloggersService.getBloggers('', 1, 10)

            expect(result).toBeTruthy()

            expect(allBloggers.pagesCount).toBe(0)
            expect(allBloggers.page).toBe(1)
            expect(allBloggers.totalCount).toBe(0)
        })
    })
})