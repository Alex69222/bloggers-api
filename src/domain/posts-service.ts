import {postsRepository} from "../repository/posts-repository";
import {transformToPaginationView} from "../helpers/transformToPaginationView";

export const postsService = {
    async createPost(title: string, shortDescription: string, content: string, bloggerId: string){
        const newPost =  await  postsRepository.createPost(title, shortDescription, content, bloggerId)
        return newPost
    },
    async getPosts(PageNumber: number, PageSize: number){
        const {postsCount, posts} = await  postsRepository.getPosts(PageNumber, PageSize)
        // const  posts = await  postsRepository.getPosts(PageNumber, PageSize)
        // return posts
        return transformToPaginationView(postsCount,PageSize,PageNumber, posts)
    },
    async getPostById(id: string){
        const post = await postsRepository.getPostById(id)
        return post
    },
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: number, id:string){
        const postIsUpdated  = await  postsRepository.updatePost(title,shortDescription, content, bloggerId, id)
        return postIsUpdated
    },
    async deletePost(id: string){
        const postIsDeleted = await  postsRepository.deletePost(id)
        return postIsDeleted
    }
}