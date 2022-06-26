import {Request, Response, Router} from "express";
import {nameValidationMiddleware} from "../middlewares/bloggers/name-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {youtubeUrlValidationMiddleware} from "../middlewares/bloggers/youtube-url-validation-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {bloggersService} from "../domain/bloggers-service";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {postsService} from "../domain/posts-service";

export const bloggersRouter = Router({})

bloggersRouter.get('/',
    async (req: Request, res: Response) => {

        const searchNameTerm = req.query.SearchNameTerm?.toString() || null
        const pageNumber = Number(req.query.PageNumber) || 1
        const pageSize = Number(req.query.PageSize) || 10

        const bloggers = await bloggersService.getBloggers(searchNameTerm, pageNumber, pageSize)
        res.send(bloggers)
    })
bloggersRouter.get('/:id',
    async (req: Request, res: Response) => {
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (blogger) {
            res.send(blogger)
        } else {
            res.sendStatus(404)
        }

    })
bloggersRouter.get('/:id/posts',
    async (req: Request, res: Response) => {
        const pageNumber = Number(req.query.PageNumber) || 1
        const pageSize = Number(req.query.PageSize) || 10
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (blogger) {
            const bloggerPosts = await bloggersService.getBloggerPosts(pageNumber, pageSize, req.params.id)
            res.send(bloggerPosts)
        } else {
            res.sendStatus(404)
        }

    }
)
bloggersRouter.post('/:id/posts',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const blogger = await bloggersService.getBloggerById(req.params.id)
        if (blogger) {
            const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.id)
            res.status(201).send(newPost)
        } else {
            res.sendStatus(404)
        }

    }
)
bloggersRouter.post('/',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const newBlogger = await bloggersService.createBlogger(req.body.name, req.body.youtubeUrl)
        res.status(201).send(newBlogger)
    })
bloggersRouter.put('/:id',
    adminAuthorizationMiddleware,
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const bloggerIsUpdated = await bloggersService.updateBlogger(req.params.id, req.body.name, req.body.youtubeUrl)
        if (bloggerIsUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
)
bloggersRouter.delete('/:id',
    adminAuthorizationMiddleware,
    async (req: Request, res: Response) => {
        const bloggerIsDeleted = await bloggersService.deleteBlogger(+req.params.id)
        if (bloggerIsDeleted) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
)