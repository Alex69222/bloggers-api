import {BloggersService, BloggerType} from "../domain/bloggers-service";
import {PostsService, PostType} from "../domain/posts-service";
import {Request, Response} from "express";
import {PaginationType} from "../helpers/transformToPaginationView";
import {PaginationQueryType} from "../types/types";
import {searchTermHandler} from "../helpers/searchTermHandler";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {inject, injectable} from "inversify";
@injectable()
export class BloggersController {

    constructor(
        @inject(BloggersService) protected bloggersService: BloggersService,
        @inject(PostsService) protected postsService: PostsService) {

    }

    async getBloggers(req: Request<{}, PaginationType<Omit<BloggerType, "_id"> & { id: string }>, {}, PaginationQueryType & { SearchNameTerm?: string | string[] }>, res: Response<PaginationType<Omit<BloggerType, "_id"> & { id: string }>>) {
        const q = req.query
        const bloggers = await this.bloggersService.getBloggers(searchTermHandler(req.query.SearchNameTerm), ...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.send(bloggers)
    }

    async getBloggerById(req: Request<{ id: string }, Omit<BloggerType, '_id'> | null, {}, {}>, res: Response<Omit<BloggerType, '_id'> & { id: string } | null>) {
        const blogger = await this.bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        res.send(blogger)
    }

    async getBloggersPosts(req: Request<{ id: string }, PaginationType<Omit<PostType, '_id'>> | null, {}, PaginationQueryType>, res: Response<PaginationType<Omit<PostType, '_id'>> | null>) {
        const blogger = await this.bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        const bloggerPosts = await this.bloggersService.getBloggerPosts(...pagePropsHandler(req.query.PageNumber, req.query.PageSize), req.params.id)
        res.send(bloggerPosts)
    }

    async createPostForBlogger(req: Request<{ id: string }, Omit<PostType, "_id"> | null, { title: string, shortDescription: string, content: string }, {}>, res: Response<Omit<PostType, "_id" | "totalInfo"> | null>) {
        const blogger = await this.bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        const newPost = await this.postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id)
        res.status(201).send(newPost)
    }

    async createBlogger(req: Request<{}, Omit<BloggerType, '_id'>, { name: string, youtubeUrl: string }, {}>, res: Response<Omit<BloggerType, '_id'> | null>) {
        const newBlogger = await this.bloggersService.createBlogger(req.body.name, req.body.youtubeUrl)
        if (!newBlogger) return res.sendStatus(500)
        res.status(201).send(newBlogger)
    }

    async updateBlogger(req: Request<{ id: string }, null, { name: string, youtubeUrl: string }, {}>, res: Response<null>) {
        const bloggerIsUpdated = await this.bloggersService.updateBlogger(req.params.id, req.body.name, req.body.youtubeUrl)
        if (!bloggerIsUpdated) return res.sendStatus(404)
        res.sendStatus(204)
    }

    async deleteBlogger(req: Request<{ id: string }, null, {}, {}>, res: Response<null>) {
        const bloggerIsDeleted = await this.bloggersService.deleteBlogger(req.params.id)
        if (!bloggerIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    }
}