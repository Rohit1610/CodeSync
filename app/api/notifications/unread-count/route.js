import connectDB from "@/config/database"
import Notification from "@/models/Notification"
import User from "@/models/User"


export const POST = async (request) => {
    const data = await request.json()
    const { id } = data
    try {
        
        await connectDB()
        if(!id){
            return new Response(JSON.stringify({ message : 'Provide user id' , ok : false}), { status : 400 })
        }
        const user = await User.findById(id)
        if(!user){
            return new Response(JSON.stringify({ message : 'Unauthorized' , ok : false}), { status : 401 })
        }

        const notifications = await Notification.find({ receiver : id ,
            read : false , toAdmin : false
        })

        const count = notifications.length

        return new Response(JSON.stringify({ message : 'Found unread message count' , ok : true  , count }) , { status : 200 })

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Internal Server Error' , ok : false}) , { status : 500 })
    }
}