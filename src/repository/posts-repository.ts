import { postsCollection} from "./db";
import {PostType} from "../domain/posts-service";
import {ObjectId} from "mongodb";


export const postsRepository = {
    async getPosts(pageNumber: number, pageSize: number): Promise<{postsCount: number, posts: (Omit<PostType, '_id'> & {id:string})[]}> {
        const postsCount = await postsCollection.count({})
        const posts = await postsCollection.aggregate<Omit<PostType, '_id'> & {id:string}>([
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0}},
            {"$skip": (pageNumber - 1) * pageSize},
            {"$limit": pageSize}
        ]).toArray()
        return {postsCount, posts}
    },
    async getPostById(id: string):Promise<Omit<PostType, '_id'> & {id: string} | null> {
        console.log(2132)
        if(!ObjectId.isValid(id)) return null
        const posts = await postsCollection.aggregate<Omit<PostType, '_id'> & {id: string}>([
            {"$match": {"_id" : new ObjectId(id)}},
            {
                "$addFields": {
                    "id": {$toString: "$_id"}
                }
            },
            {"$project": {"_id": 0}}
        ]).toArray()
        return posts[0] || null
    },
    async createPost(newPost: PostType):Promise<ObjectId | null> {
       const result = await postsCollection.insertOne(newPost)
        return result.insertedId
    },
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: string, id: string):Promise<boolean> {
        const postIsUpdated = await postsCollection.updateOne({'_id': new ObjectId(id)}, {
            $set: {
                title,
                shortDescription,
                bloggerId,
                content
            }
        })
        return postIsUpdated.matchedCount === 1
    },
    async deletePost(id: string):Promise<boolean> {
        if(!ObjectId.isValid(id)) return false
        const postIsDeleted = await postsCollection.deleteOne({'_id': new ObjectId(id)})
        return postIsDeleted.deletedCount === 1
    }
}