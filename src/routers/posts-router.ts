import {Request, Response, Router} from "express";
import {titleValidationMiddleware} from "../middlewares/posts/title-validation-middleware";
import {shortDescriptionValidationMiddleware} from "../middlewares/posts/short-description-validation-middleware";
import {contentValidationMiddleware} from "../middlewares/posts/content-validation-middleware";
import {bloggerIdValidationMiddleware} from "../middlewares/bloggers/blogger-id-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {authorizationMiddleware} from "../middlewares/authorization-middleware";
import {postsService} from "../domain/posts-service";

export const postsRouter = Router({})

postsRouter.get('/',
    async (req: Request, res: Response) => {

        const pageNumber = Number(req.query.PageNumber) || 1
        const pageSize = Number(req.query.PageSize) || 10
        const posts = await postsService.getPosts(pageNumber, pageSize)
        res.send(posts)
    })
postsRouter.get('/:id',
    async (req: Request, res: Response) => {
        const post = await postsService.getPostById(+req.params.id)
        if(post){
            res.send(post)
        }else{
            res.sendStatus(404)
        }
    // const post = postsRepository.getPosts(+req.params.id)
    // if (post) {
    //     res.send(post)
    // } else {
    //     res.sendStatus(404)
    // }
})

postsRouter.put('/:id',
    authorizationMiddleware,
    titleValidationMiddleware,
    shortDescriptionValidationMiddleware,
    contentValidationMiddleware,
    bloggerIdValidationMiddleware,
    validationResultMiddleware,
   async (req: Request, res: Response) => {
        const postIsUpdated = await  postsService.updatePost(req.body.title, req.body.shortDescription, req.body.content, +req.body.bloggerId, +req.params.id)
       if(postIsUpdated){
           res.sendStatus(204)
       }else{
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
   async (req: Request, res: Response) => {
        const newPost = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, +req.body.bloggerId)
        res.status(201).send(newPost)
    }
)

postsRouter.delete('/:id',
    authorizationMiddleware,
   async (req: Request, res: Response) => {
        const postIsDeleted = await postsService.deletePost(+req.params.id)
        if (postIsDeleted) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })