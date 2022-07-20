import {Request, Response, Router} from "express";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {bloggerIdValidationMiddleware} from "../middlewares/bloggers/blogger-id-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {postsService, PostType} from "../domain/posts-service";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {commentsService, CommentType} from "../domain/comments-service";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {commentContentValidationMiddleware} from "../middlewares/comments/comment-content-validation-middleware";
import {PaginationType} from "../helpers/transformToPaginationView";
import {PaginationQueryType} from "../types/types";

export const postsRouter = Router({})

postsRouter.get('/',
    async (req: Request<{}, PaginationType<Omit<PostType, "_id"> & {id: string}>, {}, { PageNumber: string, PageSize: string }>, res: Response<PaginationType<Omit<PostType, "_id"> & {id: string}>>) => {
        const posts = await postsService.getPosts(...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.send(posts)
    })

postsRouter.get('/:id',
    async (req: Request<{ id: string }, Omit<PostType, "_id"> & {id: string} | null, {}, {}>, res: Response<Omit<PostType, "_id"> & {id: string} | null>) => {
        const post = await postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        res.send(post)
    })

postsRouter.post('/:id/comments',
    authMiddleware,
    commentContentValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{ id: string }, Omit<CommentType, "_id" | "postId"> & {id: string} | string, { content: string }, {}>, res: Response<Omit<CommentType, "_id" | "postId"> & {id: string} | string>) => {
        const post = await postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const newComment = await commentsService.addComment(req.user!.id, req.user!.accountData.userName, req.body.content, req.params.id)
        if (!newComment) return res.status(400).send('Service is temporary unavailable. Please try again later.')
        res.status(201).send(newComment)
    }
)
postsRouter.get('/:id/comments',

    async (req: Request<{ id: string }, PaginationType<Omit<CommentType, "_id" | "postId">>, {}, PaginationQueryType>, res: Response<PaginationType<Omit<CommentType, "_id" | "postId">> | null>) => {
        const post = await postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const commentsForSpecifiedPost = await commentsService.getCommentsForSpecifiedPost(
            ...pagePropsHandler(req.query.PageNumber, req.query.PageSize),
            req.params.id
        )
        res.status(200).send(commentsForSpecifiedPost)
    }
)

postsRouter.put('/:id',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{ id: string }, null, { title: string, shortDescription: string, content: string, bloggerId: string }, {}>, res: Response<null>) => {
        const postIsUpdated = await postsService.updatePost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId, req.params.id)
        if (!postIsUpdated) return res.sendStatus(404)
        res.sendStatus(204)
    }
)

postsRouter.post('/',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{}, Omit<PostType, "_id" > & {id: string} | string, { title: string, shortDescription: string, content: string, bloggerId: string }>, res: Response<Omit<PostType, "_id"> & {id: string} | string>) => {
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId)
        if(!newPost) return res.status(400).send('Something went wrong. Please try again later.')
        res.status(201).send(newPost)
    }
)

postsRouter.delete('/:id',
    adminAuthorizationMiddleware,
    async (req: Request<{id: string},null, {}, {}>, res: Response<null>) => {
        const postIsDeleted = await postsService.deletePost(req.params.id)
        if (!postIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    })