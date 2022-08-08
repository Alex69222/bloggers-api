import {BloggersRepository,
    // bloggersRepository
} from "../repository/bloggers-repository";
import {ObjectId} from "mongodb";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {PostType} from "./posts-service";
import {inject, injectable} from "inversify";

export type BloggerType = {
    _id: ObjectId
    name: string
    youtubeUrl: string
}

@injectable()
export class BloggersService{
    constructor( @inject(BloggersRepository) protected bloggersRepository: BloggersRepository) {
    }
    async getBloggers(searchNameTerm: string, PageNumber: number, PageSize: number): Promise<PaginationType<(Omit<BloggerType, "_id"> & {id: string})>> {
        const {bloggers, bloggersCount } = await this.bloggersRepository.getBloggers(searchNameTerm, PageNumber, PageSize)
        return transformToPaginationView<(Omit<BloggerType, "_id"> & {id: string})>(bloggersCount, PageSize, PageNumber, bloggers)
    }
    async getBloggerById(id: string):Promise<Omit<BloggerType, '_id'> & { id: string } | null>{
        return await this.bloggersRepository.getBloggerById(id)
    }
    async createBlogger(name: string, youtubeUrl: string):Promise<Omit<BloggerType, '_id'> & {id: string} | null> {
        const newBlogger:BloggerType = {
            _id: new ObjectId(),
            name,
            youtubeUrl
        }
        const insertedId = await this.bloggersRepository.createBlogger(newBlogger)
        if(!insertedId) return null
        return {
            id: insertedId.toString(),
            name: newBlogger.name,
            youtubeUrl: newBlogger.youtubeUrl
        }
    }
    async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        const bloggerIsUpdated = await this.bloggersRepository.updateBlogger(id, name, youtubeUrl)
        return bloggerIsUpdated
    }
    async deleteBlogger(id: string): Promise<boolean> {
        return await this.bloggersRepository.deleteBlogger(id)
    }
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string):Promise<PaginationType<Omit<PostType, '_id'>>> {
        const { bloggerPostsCount, bloggerPosts }= await this.bloggersRepository.getBloggerPosts(pageNumber, pageSize, id)
        return transformToPaginationView<Omit<PostType, '_id'>>(bloggerPostsCount, pageSize, pageNumber,bloggerPosts)
    }
}
// export const bloggersService = new BloggersService()