import {Request, Response, Router} from "express";
import {nameValidationMiddleware} from "../middlewares/bloggers/name-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {youtubeUrlValidationMiddleware} from "../middlewares/bloggers/youtube-url-validation-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {bloggersService, BloggerType} from "../domain/bloggers-service";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {postsService, PostType} from "../domain/posts-service";
import {PaginationQueryType} from "../types/types";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {PaginationType} from "../helpers/transformToPaginationView";
import {searchTermHandler} from "../helpers/searchTermHandler";

export const bloggersRouter = Router({})
bloggersRouter.get('/',
    async (req: Request<{}, PaginationType<Omit<BloggerType, "_id"> & {id: string}>, {}, PaginationQueryType & { SearchNameTerm?: string | string[] }>, res: Response<PaginationType<Omit<BloggerType, "_id"> & {id: string}>>) => {
       const q = req.query
        const bloggers = await bloggersService.getBloggers(searchTermHandler(req.query.SearchNameTerm), ...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.send(bloggers)
    })
bloggersRouter.get('/:id',
    async (req: Request<{ id: string }, Omit<BloggerType, '_id'> | null, {}, {}>, res: Response<Omit<BloggerType, '_id'> & { id: string } | null>) => {
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        res.send(blogger)
    })
bloggersRouter.get('/:id/posts',
    async (req: Request<{ id: string }, PaginationType<Omit<PostType, '_id'>> | null, {}, PaginationQueryType>, res: Response<PaginationType<Omit<PostType, '_id'>> | null>) => {
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        const bloggerPosts = await bloggersService.getBloggerPosts(...pagePropsHandler(req.query.PageNumber, req.query.PageSize), req.params.id)
        res.send(bloggerPosts)
    }
)
bloggersRouter.post('/:id/posts',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{ id: string }, Omit<PostType, "_id"> | null, { title: string, shortDescription: string, content: string }, {}>, res: Response<Omit<PostType, "_id"> | null>) => {
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (!blogger) return res.sendStatus(404)
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id)
        res.status(201).send(newPost)
    }
)
bloggersRouter.post('/',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{}, Omit<BloggerType, '_id'>, { name: string, youtubeUrl: string }, {}>, res: Response<Omit<BloggerType, '_id'> | null>) => {
        const newBlogger = await bloggersService.createBlogger(req.body.name, req.body.youtubeUrl)
        if(!newBlogger) return res.sendStatus(500)
        res.status(201).send(newBlogger)
    })
bloggersRouter.put('/:id',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{ id: string }, null, { name: string, youtubeUrl: string }, {}>, res: Response<null>) => {
        const bloggerIsUpdated = await bloggersService.updateBlogger(req.params.id, req.body.name, req.body.youtubeUrl)
        if (!bloggerIsUpdated) return res.sendStatus(404)
        res.sendStatus(204)
    }
)
bloggersRouter.delete('/:id',
    adminAuthorizationMiddleware,
    async (req: Request<{id: string}, null, {}, {}>, res: Response<null>) => {
        const bloggerIsDeleted = await bloggersService.deleteBlogger(req.params.id)
        if (!bloggerIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    }
)