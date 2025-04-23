import connectDB from "@/config/database"
import Notification from "@/models/Notification"
import User from "@/models/User"


export const POST = async (request) => {
    const data = await request.json()
    const { id , body , rating } = data
    
    try {

        await connectDB()

        if(!id || !body || rating == undefined){
            return new Response(JSON.stringify({ message : 'Provide all the fields' , ok : false}), { status : 400 })
        }

        const user = await User.findById(id)
        if(!user){
            return new Response(JSON.stringify({ message : 'No such user exists' , ok : false}), { status : 401 })
        }

        const feedback = new Notification({
            sender : id,
            receiver : '664da6fa0a207e01f76dfa25',
            body,
            rating : rating > 0 ? rating : undefined,
        })

        await feedback.save()

        return new Response(JSON.stringify({ message : 'Feedback submitted successfully' , ok : true}), { status : 200 })


    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Internal Server Error' , ok : false}), { status : 500 })
    }
}