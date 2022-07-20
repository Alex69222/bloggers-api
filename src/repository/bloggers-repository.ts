import {bloggersCollection, postsCollection} from "./db";
import {BloggerType} from "../domain/bloggers-service";
import {PostType} from "../domain/posts-service";
import {ObjectId} from "mongodb";

export const bloggersRepository = {

    async getBloggers(searchNameTerm: string | null, pageNumber: number, pageSize: number): Promise<{ bloggersCount: number, bloggers: (Omit<BloggerType, '_id'> & { id: string })[] }> {

        const filter: { name?: any } = {}
        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm}
        }
        const bloggersCount = await bloggersCollection.countDocuments(filter)
        const bloggers = await bloggersCollection
            .aggregate<Omit<BloggerType, '_id'> & { id: string }>([
                {"$match": filter},
                {
                    "$addFields": {
                        "id": {$toString: "$_id"}
                    }
                },
                {"$project": {"_id": 0}},
                {"$skip": (pageNumber - 1) * pageSize},
                {"$limit": pageSize}
            ])
            .toArray()
        return {bloggers, bloggersCount}
    },
    async getBloggerById(id: string): Promise<Omit<BloggerType, '_id' > & { id: string } | null> {
        if(!ObjectId.isValid(id)) return null
        const bloggers = await bloggersCollection.aggregate<Omit<BloggerType, '_id'> & { id: string }>([
            {"$match": {"_id" : new ObjectId(id)}},
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0}}
        ]).toArray()
        return bloggers[0] || null


    },
    async createBlogger(newBlogger: BloggerType): Promise<ObjectId | null> {
        const result = await bloggersCollection.insertOne(newBlogger)
        return result.insertedId || null

    },
    async updateBlogger(id: string, name: string, youtubeUrl: string): Promise<boolean> {
        if(!ObjectId.isValid(id)) return false
        const bloggerIsUpdated = await bloggersCollection.updateOne({"_id": new ObjectId(id)}, {$set: {name, youtubeUrl}})
        return bloggerIsUpdated.matchedCount === 1
    },
    async deleteBlogger(id: string): Promise<boolean> {
        if(!ObjectId.isValid(id)) return false
        const bloggerIsDeleted = await bloggersCollection.deleteOne({"_id": new ObjectId(id)})
        return bloggerIsDeleted.deletedCount === 1
    },
    async getBloggerPosts(pageNumber: number, pageSize: number, id: string): Promise<{ bloggerPostsCount: number, bloggerPosts: Omit<PostType, '_id'>[] }> {
        const bloggerPostsCount = await postsCollection.count({bloggerId: id})
        const bloggerPosts = await postsCollection.find({bloggerId: id})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .project<Omit<PostType, '_id'>>({_id: 0})
            .toArray()

        return {bloggerPostsCount, bloggerPosts}
    }
}