import {bloggersCollection, BloggersModelClass, PostModelClass, postsCollection} from "./db";
import {BloggerType} from "../domain/bloggers-service";
import {PostType} from "../domain/posts-service";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {idMapper} from "../helpers/id-mapper";
@injectable()
export class BloggersRepository{
    async getBloggers(searchNameTerm: string | null, pageNumber: number, pageSize: number ): Promise<{ bloggersCount: number, bloggers: (Omit<BloggerType, "_id"> & {id: string})[] }> {

        const filter: { name?: any } = {}
        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: '-i'}
        }
        const bloggersCount = await BloggersModelClass.count(filter)

        let bloggersDb = await BloggersModelClass.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean()
        const bloggers: (Omit<BloggerType, "_id"> & {id: string})[] = idMapper(bloggersDb)
        return { bloggersCount, bloggers}
    }
    async getBloggerById(id: string): Promise<Omit<BloggerType, '_id'> & { id: string } | null> {
        if (!ObjectId.isValid(id)) return null
        const blogger: (Omit<BloggerType, "_id"> & {id: string}) | null = await  BloggersModelClass.findById(id).lean()
        if(!blogger) return null
        return idMapper(blogger)

    }
    async createBlogger(newBlogger: BloggerType): Promise<ObjectId | null> {
        try {
            const bloggerInstance = new BloggersModelClass(newBlogger)
            await bloggerInstance.save()
            return newBlogger._id
        } catch (e) {
            console.log(e)
            return null
        }
    }
    async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false
        const updateResult = await BloggersModelClass.findByIdAndUpdate(new ObjectId(id), {name, youtubeUrl})
        if(!updateResult) return false
        return true
    }
    async deleteBlogger(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false
        const deleteResult = await BloggersModelClass.findByIdAndDelete(new ObjectId(id))
        if(!deleteResult) return  false
        return true
    }
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string, userId: string | undefined): Promise<{ bloggerPostsCount: number, bloggerPosts: (Omit<PostType, '_id'> & { id: string })[] }> {
        const bloggerPostsCount = await PostModelClass.count({bloggerId: id})
        const bpostsDB = await PostModelClass.find({bloggerId: id}).skip(((pageNumber - 1) * pageSize)).limit(pageSize).lean()
         let bloggerPosts = idMapper(bpostsDB)

        bloggerPosts.forEach((bp: any) =>{
            if (userId) {
                const userLikeStatus = bp.totalInfo.find((el: { userId: string; }) => el.userId === userId)
                if (userLikeStatus) {
                    bp.extendedLikesInfo.myStatus = userLikeStatus.likeStatus
                }
            }
            delete bp.totalInfo
        })
        return {bloggerPostsCount, bloggerPosts}
    }
}
// export const bloggersRepository = new BloggersRepository()