import {postsRepository} from "../repository/posts-repository";

export const postsService = {
    async createPost(title: string, shortDescription: string, content: string, bloggerId: number){
        const newPost =  await  postsRepository.createPost(title, shortDescription, content, bloggerId)
        return newPost
    },
    async getPosts(pageNumber: number, pageSize: number){
        const posts = await  postsRepository.getPosts(pageNumber, pageSize)
        return posts
    },
    async getPostById(id: number){
        const post = await postsRepository.getPostById(id)
        return post
    },
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: number, id:number){
        const postIsUpdated  = await  postsRepository.updatePost(title,shortDescription, content, bloggerId, id)
        return postIsUpdated
    },
    async deletePost(id: number){
        const postIsDeleted = await  postsRepository.deletePost(id)
        return postIsDeleted
    }
}