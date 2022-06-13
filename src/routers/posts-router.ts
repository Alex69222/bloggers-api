import {Request, Response, Router} from "express";
import {postsRepository} from "../repository/posts-repository";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {contentValidationMiddleware} from "../middlewares/posts/content-validation-middleware";
import {bloggerIdValidationMiddleware} from "../middlewares/bloggers/blogger-id-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {authorizationMiddleware} from "../middlewares/authorization-middleware";

export const postsRouter = Router({})

postsRouter.get('/', (req: Request, res: Response) => {
    res.send(postsRepository.getPosts())
})
postsRouter.get('/:id', (req: Request, res: Response) => {
    const post = postsRepository.getPosts(+req.params.id)
    if (post) {
        res.send(post)
    } else {
        res.sendStatus(404)
    }
})

postsRouter.put('/:id',
    authorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    contentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    (req: Request, res: Response) => {
        const postIsUpdated = postsRepository.updatePost(req.body.title, req.body.shortDescription, req.body.content, +req.body.bloggerId, +req.params.id)
        if (postIsUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
)

postsRouter.post('/',
    authorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    contentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
    (req: Request, res: Response) => {
        const newPost = postsRepository.createPost(req.body.title, req.body.shortDescription, req.body.content, +req.body.bloggerId)
        if (newPost) {
            res.status(201).send(newPost)
        } else {
            res.sendStatus(404)
        }
    }
)

postsRouter.delete('/:id',
    authorizationMiddleware,
    (req: Request, res: Response) =>{
    const postIsDeleted = postsRepository.deletePost(+req.params.id)
    if(postIsDeleted){
        res.sendStatus(204)
    }else{
        res.sendStatus(404)
    }
})