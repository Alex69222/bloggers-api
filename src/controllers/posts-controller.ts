import {CommentsService, CommentType} from "../domain/comments-service";
import {PostsService, PostType} from "../domain/posts-service";
import {Request, Response} from "express";
import {PaginationType} from "../helpers/transformToPaginationView";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {PaginationQueryType} from "../types/types";
import {inject, injectable} from "inversify";
@injectable()
export class PostsController {
    constructor(
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(PostsService) protected postsService: PostsService) {
    }

    async getPosts(req: Request<{}, PaginationType<Omit<PostType, "_id"> & { id: string }>, {}, { PageNumber: string, PageSize: string }>, res: Response<PaginationType<Omit<PostType, "_id"> & { id: string }>>) {
        const userId = req.user?.id
        const posts = await this.postsService.getPosts(...pagePropsHandler(req.query.PageNumber, req.query.PageSize), userId)
        res.send(posts)
    }

    async getPostById(req: Request<{ id: string }, Omit<PostType, "_id"> & { id: string } | null, {}, {}>, res: Response<Omit<PostType, "_id"> & { id: string } | null>) {
        const userId = req.user?.id
        const post = await this.postsService.getPostById(req.params.id, userId)
        if (!post) return res.sendStatus(404)
        res.send(post)
    }

    async createCommentToPost(req: Request<{ id: string }, Omit<CommentType, "_id" | "postId" | "totalInfo"> & { id: string } | string, { content: string }, {}>, res: Response<Omit<CommentType, "_id" | "postId" | "totalInfo"> & { id: string } | string>) {
        const post = await this.postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const newComment = await this.commentsService.addComment(req.user!.id, req.user!.accountData.userName, req.body.content, req.params.id)
        if (!newComment) return res.status(400).send('Service is temporary unavailable. Please try again later.')
        res.status(201).send(newComment)
    }

    async getPostsComments(req: Request<{ id: string }, PaginationType<Omit<CommentType, "_id" | "postId">>, {}, PaginationQueryType>, res: Response<PaginationType<Omit<CommentType, "_id" | "postId">> | null>) {
        const userId = req.user?.id
        const post = await this.postsService.getPostById(req.params.id)
        if (!post) return res.sendStatus(404)
        const commentsForSpecifiedPost = await this.commentsService.getCommentsForSpecifiedPost(
            ...pagePropsHandler(req.query.PageNumber, req.query.PageSize),
            req.params.id, userId
        )
        res.status(200).send(commentsForSpecifiedPost)
    }

    async updatePost(req: Request<{ id: string }, null, { title: string, shortDescription: string, content: string, bloggerId: string }, {}>, res: Response<null>) {
        const postIsUpdated = await this.postsService.updatePost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId, req.params.id)
        if (!postIsUpdated) return res.sendStatus(404)
        res.sendStatus(204)
    }

    async createPost(req: Request<{}, Omit<PostType, "_id"> & { id: string } | string, { title: string, shortDescription: string, content: string, bloggerId: string }>, res: Response<Omit<PostType, "_id" | "totalInfo"> & { id: string } | string>) {
        const newPost = await this.postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.bloggerId)
        if (!newPost) return res.status(400).send('Something went wrong. Please try again later.')
        res.status(201).send(newPost)
    }

    async deletePost(req: Request<{ id: string }, null, {}, {}>, res: Response<null>) {
        const postIsDeleted = await this.postsService.deletePost(req.params.id)
        if (!postIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    }

    async setPostLikeStatus(req: Request<{id: string},null,{likeStatus: string},{}>, res: Response<null>){
        const post = await this.postsService.getPostById(req.params.id)
        if(!post) return res.sendStatus(404)
        await this.postsService.setPostLikeStatus(req.params.id, req.user!.id, req.user!.accountData.userName, req.body.likeStatus)
        res.sendStatus(204)
    }
}