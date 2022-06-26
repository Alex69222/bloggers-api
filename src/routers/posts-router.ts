import {Request, Response, Router} from "express";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {postContentValidationMiddleware} from "../middlewares/posts/post-content-validation-middleware";
import {bloggerIdValidationMiddleware} from "../middlewares/bloggers/blogger-id-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {postsService} from "../domain/posts-service";
import {authMiddleware} from "../middlewares/users/auth-middleware";
import {commentsService} from "../domain/comments-service";
import {pagePropsHandler} from "../helpers/pagePropsHandler";

export const postsRouter = Router({})

postsRouter.get('/',
    async (req: Request, res: Response) => {
        const posts = await postsService.getPosts(Number(req.query.PageNumber) || 1, Number(req.query.PageSize) || 10)
        res.send(posts)
    })

postsRouter.get('/:id',
    async (req: Request, res: Response) => {
        const post = await postsService.getPostById(req.params.id)
        if (post) {
            res.send(post)
        } else {
            res.sendStatus(404)
        }
    })

postsRouter.post('/:id/comments',
    authMiddleware,
    postContentValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const post = await postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const newComment = await commentsService.addComment(req.user!.id, req.user!.login, req.body.content, req.params.id)
        res.status(201).send(newComment)
    }
)
postsRouter.get('/:id/comments',

    async (req: Request, res: Response) => {
        const post = await postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const commentsForSpecifiedPost = await commentsService.getCommentsForSpecifiedPost(
            ...pagePropsHandler(req.query.PageNumber, req.query.PageSize),
            req.params.id
        )
        return res.status(200).send(commentsForSpecifiedPost)
    }
)

postsRouter.put('/:id',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const postIsUpdated = await postsService.updatePost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId, req.params.id)
        if (postIsUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
)

postsRouter.post('/',
    adminAuthorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    postContentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId)
        res.status(201).send(newPost)
    }
)

postsRouter.delete('/:id',
    adminAuthorizationMiddleware,
    async (req: Request, res: Response) => {
        const postIsDeleted = await postsService.deletePost(+req.params.id)
        if (postIsDeleted) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })