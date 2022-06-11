import {Request, Response, Router} from "express";
import {bloggersRepository} from "../repository/bloggers-repository";
import {nameValidationMiddleware} from "../middlewares/bloggers/name-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {youtubeUrlValidationMiddleware} from "../middlewares/bloggers/youtube-url-validation-middleware";

export const bloggersRouter = Router({})

bloggersRouter.get('/', (req: Request, res: Response) => {
    const bloggers = bloggersRepository.getBloggers()
    res.send(bloggers)
})
bloggersRouter.get('/:id', (req: Request, res: Response) => {
    const blogger = bloggersRepository.getBloggers(+req.params.id)
    if (blogger) {
        res.send(blogger)
    } else {
        res.sendStatus(404)
    }

})

bloggersRouter.post('/',
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    (req: Request, res: Response) => {
        const newBlogger = bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl)
        res.status(201).send(newBlogger)
    })
bloggersRouter.put('/:id',
    nameValidationMiddleware,
    youtubeUrlValidationMiddleware,
    validationResultMiddleware,
    (req: Request, res: Response) => {
        const bloggerIsUpdated = bloggersRepository.updateBlogger(+req.params.id, req.body.name, req.body.youtubeUrl)
        if (bloggerIsUpdated) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
)
bloggersRouter.delete('/:id',
    (req: Request, res: Response) => {
        const bloggerIsDeleted = bloggersRepository.deleteBlogger(+req.params.id)
        if(bloggerIsDeleted){
            res.sendStatus(204)
        }else{
            res.sendStatus(404)
        }
    }
)