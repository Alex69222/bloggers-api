import {postsRepository} from "../repository/posts-repository";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {bloggersService} from "./bloggers-service";
import {ObjectId} from "mongodb";

export type PostType = {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    bloggerId: string
    bloggerName: string
}
export const postsService = {
    async createPost(title: string, shortDescription: string, content: string, bloggerId: string): Promise<Omit<PostType, "_id"> & { id: string } | null> {
        const blogger = await bloggersService.getBloggerById(bloggerId)
        const newPost = {
            _id: new ObjectId(),
            title,
            shortDescription,
            content,
            bloggerId,
            bloggerName: blogger!.name
        }
       const insertedId =  await postsRepository.createPost(newPost)
        if(!insertedId) return  null

        let {_id, ...createdPost} = newPost
        return {
            id: insertedId.toString(),
            ...createdPost
        }
    },
    async getPosts(PageNumber: number, PageSize: number):Promise<PaginationType<Omit<PostType, '_id'> & {id:string}>> {
        const {postsCount, posts} = await postsRepository.getPosts(PageNumber, PageSize)
        return transformToPaginationView<Omit<PostType, '_id'> & {id:string}>(postsCount, PageSize, PageNumber, posts)
    },
    async getPostById(id: string):Promise<Omit<PostType, "_id" > & {id: string} | null> {
        const post = await postsRepository.getPostById(id)
        return post
    },
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: string, id: string):Promise<boolean> {
        const postIsUpdated = await postsRepository.updatePost(title, shortDescription, content, bloggerId, id)
        return postIsUpdated
    },
    async deletePost(id: string):Promise<boolean> {
        const postIsDeleted = await postsRepository.deletePost(id)
        return postIsDeleted
    }
}