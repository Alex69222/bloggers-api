import {bloggersCollection, postsCollection} from "./db";


export const postsRepository = {
    async getPosts(pageNumber: number, pageSize: number) {
        const postsCount = await postsCollection.count({})
        const posts = await postsCollection.find({})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .project({_id: 0})
            .toArray()

        // return {
        //     "pagesCount": Math.ceil(postsCount / pageSize),
        //     "page": pageNumber,
        //     pageSize,
        //     "totalCount": postsCount,
        //     "items": posts
        // }
        return {postsCount, posts}
    },
    async getPostById(id: string) {
        const post = await postsCollection.findOne({id}, {projection: {_id: 0}})
        return post
    },
    async createPost(title: string, shortDescription: string, content: string, bloggerId: string) {
        const blogger = await bloggersCollection.findOne({id: bloggerId})
        const newPost = {
            id: Number(new Date()).toString(),
            title,
            shortDescription,
            content,
            bloggerId,
            bloggerName: blogger!.name
        }
        await postsCollection.insertOne(newPost)
        return {
            id: newPost.id,
            title,
            shortDescription,
            content,
            bloggerId,
            bloggerName: newPost.bloggerName
        }
    },
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: number, id: string) {
        const postIsUpdated = await postsCollection.updateOne({id}, {
            $set: {
                title,
                shortDescription,
                bloggerId,
                content
            }
        })
        return postIsUpdated.matchedCount === 1
    },
    async deletePost(id: number) {
        const postIsDeleted = await postsCollection.deleteOne({id})
        return postIsDeleted.deletedCount === 1
    }
}