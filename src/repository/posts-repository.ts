import {bloggersCollection, postsCollection} from "./db";

const posts = [
    {
        "id": 0,
        "title": "My first post",
        "shortDescription": "About me",
        "content": "Hello, it's me!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    }, {
        "id": 1,
        "title": "My second post",
        "shortDescription": "About me. part 2",
        "content": "I'm SW blogger. I'll tell you everithing about Star Wars!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    }, {
        "id": 2,
        "title": "My third post",
        "shortDescription": "About me. part 3",
        "content": "Guess what! I'm star wars fan!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    },
]
const findPost = (id: number) => {
    return posts.find(p => p.id === id)
}
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
    async getPostById(id: number) {
        const post = await postsCollection.findOne({id}, {projection: {_id: 0}})
        return post
    },
    async createPost(title: string, shortDescription: string, content: string, bloggerId: number) {
        const blogger = await bloggersCollection.findOne({id: bloggerId})
        const newPost = {
            id: +(new Date()),
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
    async updatePost(title: string, shortDescription: string, content: string, bloggerId: number, id: number) {
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