import {bloggersRepository} from "../repository/bloggers-repository";
import {ObjectId} from "mongodb";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {PostType} from "./posts-service";

export type BloggerType = {
    _id: ObjectId
    name: string
    youtubeUrl: string
}
export const bloggersService = {
    async getBloggers(searchNameTerm: string, PageNumber: number, PageSize: number): Promise<PaginationType<(Omit<BloggerType, "_id"> & {id: string})>> {
        const {bloggers, bloggersCount } = await bloggersRepository.getBloggers(searchNameTerm, PageNumber, PageSize)
        return transformToPaginationView<(Omit<BloggerType, "_id"> & {id: string})>(bloggersCount, PageSize, PageNumber, bloggers)
    },
    async getBloggerById(id: string):Promise<Omit<BloggerType, '_id'> & { id: string } | null>{
        return await bloggersRepository.getBloggerById(id)
    },
    async createBlogger(name: string, youtubeUrl: string):Promise<Omit<BloggerType, '_id'> & {id: string} | null> {
        const newBlogger:BloggerType = {
            _id: new ObjectId(),
            name,
            youtubeUrl
        }
         const insertedId = await bloggersRepository.createBlogger(newBlogger)
        if(!insertedId) return null
        return {
            id: insertedId.toString(),
            name: newBlogger.name,
            youtubeUrl: newBlogger.youtubeUrl
        }
    },
    async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        const bloggerIsUpdated = await bloggersRepository.updateBlogger(id, name, youtubeUrl)
        return bloggerIsUpdated
    },
    async deleteBlogger(id: string): Promise<boolean> {
        return await bloggersRepository.deleteBlogger(id)
    },
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string):Promise<PaginationType<Omit<PostType, '_id'>>> {
        const { bloggerPostsCount, bloggerPosts }= await bloggersRepository.getBloggerPosts(pageNumber, pageSize, id)
        return transformToPaginationView<Omit<PostType, '_id'>>(bloggerPostsCount, pageSize, pageNumber,bloggerPosts)
    }
}