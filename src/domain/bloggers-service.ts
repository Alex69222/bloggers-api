import {bloggersRepository} from "../repository/bloggers-repository";

export const bloggersService = {
    async getBloggers(searchNameTerm: string | null, pageNumber: number, pageSize: number) {
        const bloggers = await bloggersRepository.getBloggers(searchNameTerm, pageNumber, pageSize)
        return bloggers
    },
    async getBloggerById(id: string) {
        return await bloggersRepository.getBloggerById(id)
    },
    async createBlogger(name: string, youtubeUrl: string) {
        const newBlogger = await bloggersRepository.createBlogger(name, youtubeUrl)
        return newBlogger
    },
    async updateBlogger(id: string, name: string, youtubeUrl: string) {

        const bloggerIsUpdated = await bloggersRepository.updateBlogger(id, name, youtubeUrl)
        return bloggerIsUpdated

    },
    async deleteBlogger(id: string) {
        const bloggerIsDeleted = await bloggersRepository.deleteBlogger(id)
        return bloggerIsDeleted
    },
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string){
        const posts = await bloggersRepository.getBloggerPosts(pageNumber, pageSize, id)
        return posts
    }
}