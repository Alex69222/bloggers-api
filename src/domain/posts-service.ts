// import {postsRepository} from "../repository/posts-repository";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
// import {bloggersService} from "./bloggers-service";
import {ObjectId} from "mongodb";
import {PostsRepository} from "../repository/posts-repository";
import {BloggersService} from "./bloggers-service";
import {inject, injectable} from "inversify";
import {LIKES} from "../types/types";
import {PostsLikesRepository} from "../repository/posts-likes-repository";

export type NewestLikes = Array<{
    addedAt: Date
    userId: string
    login: string
}>

export type extendedLikesInfo = {
    likesCount: number,
    dislikesCount: number
    newestLikes: NewestLikes
    myStatus: "Like" | "Dislike" | "None"

}
export type PostType = {
    _id: ObjectId
    title: string
    addedAt: Date
    shortDescription: string
    content: string
    bloggerId: string
    bloggerName: string
    extendedLikesInfo: extendedLikesInfo
    totalInfo:Array<{
        addedAt: Date
        userId: string
        login: string
        likeStatus: string
    }>
}

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BloggersService) protected bloggersService: BloggersService,
        @inject(PostsLikesRepository) protected postsLikesRepository: PostsLikesRepository) {
    }

    async createPost(title: string, shortDescription: string, content: string, bloggerId: string): Promise<Omit<PostType, "_id" | "totalInfo" > & { id: string } | null> {
        const blogger = await this.bloggersService.getBloggerById(bloggerId)
        const newPost = {
            _id: new ObjectId(),
            title,
            addedAt: new Date(),
            shortDescription,
            content,
            bloggerId,
            bloggerName: blogger!.name,
            extendedLikesInfo:{
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LIKES.NONE,
                newestLikes: [],
            },
            totalInfo: []


        }
        const insertedId = await this.postsRepository.createPost(newPost)
        if (!insertedId) return null

        let {_id,totalInfo,   ...createdPost} = newPost

        return {
            ...createdPost,
            id: insertedId.toString(),
        }
    }

    async getPosts(PageNumber: number, PageSize: number, userId?: string | undefined): Promise<PaginationType<Omit<PostType, '_id'> & { id: string }>> {
        const {postsCount, posts} = await this.postsRepository.getPosts(PageNumber, PageSize, userId)
        return transformToPaginationView<Omit<PostType, '_id'> & { id: string }>(postsCount, PageSize, PageNumber, posts)
    }

    async getPostById(id: string, userId?: string | undefined): Promise<Omit<PostType, "_id"> & { id: string } | null> {
        const post = await this.postsRepository.getPostById(id, userId)
        return post
    }

    async updatePost(title: string, shortDescription: string, content: string, bloggerId: string, id: string): Promise<boolean> {
        const postIsUpdated = await this.postsRepository.updatePost(title, shortDescription, content, bloggerId, id)
        return postIsUpdated
    }

    async deletePost(id: string): Promise<boolean> {
        const postIsDeleted = await this.postsRepository.deletePost(id)
        return postIsDeleted
    }
    async setPostLikeStatus(postId: string, userId: string, userLogin: string, likeStatus: string){
        const likeIsAddedToPost = await this.postsRepository.addLike(postId, userId, userLogin, likeStatus)
        if(!likeIsAddedToPost) return false
    }
}

// export const postsService = new PostsService()