import {bloggersCollection, postsCollection} from "./db";
import {ObjectId} from "mongodb";

export const bloggersRepository = {

    async getBloggers(searchNameTerm: string | null, pageNumber: number, pageSize: number) {

        const filter: any = {}
        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm}
        }
        const bloggersCount = await bloggersCollection.count(filter)
        const bloggers = await bloggersCollection
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .project({_id: 0})
            .toArray()

        return {
            pagesCount: Math.ceil(+bloggersCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: bloggersCount,
            items: [
                ...bloggers
            ]
        }
    },
    async getBloggerById(id: string) {
        const blogger = await bloggersCollection.findOne({id: id}, {projection: {_id: 0}})
        return blogger
    },
    async createBlogger(name: string, youtubeUrl: string) {
        const newBlogger = {
            id: Number(new Date()).toString(),
            name,
            youtubeUrl
        }
        await bloggersCollection.insertOne(newBlogger)

        return {
            id: newBlogger.id,
            name: newBlogger.name,
            youtubeUrl: newBlogger.youtubeUrl
        }
    },
    async updateBlogger(id: number, name: string, youtubeUrl: string) {
        const bloggerIsUpdated = await bloggersCollection.updateOne({id}, {$set: {name, youtubeUrl}})

        return bloggerIsUpdated.matchedCount === 1

    },
    async deleteBlogger(id: number) {
        const bloggerIsDeleted = await bloggersCollection.deleteOne({id})
        return bloggerIsDeleted.deletedCount === 1
    },
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string) {
        const bloggerPostsCount = await postsCollection.count({bloggerId: id})
        const bloggerPosts = await postsCollection.find({bloggerId: id})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .project({_id: 0})
            .toArray()

        return {
            "pagesCount": Math.ceil(bloggerPostsCount / pageSize),
            "page": pageNumber,
            pageSize,
            "totalCount": bloggerPostsCount,
            "items": [
                ...bloggerPosts
            ]
        }
    }
}