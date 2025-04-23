import connectDB from "@/config/database"
import Notification from "@/models/Notification"


export const PUT = async (request , { params }) => {
    try {
        const { id } = params
        await connectDB()

        if(!id){
            return new Response(JSON.stringify({ message : 'Fill all the fields' , ok : false}) , { staus : 400 })
        }

        const notification = await Notification.findById(id)
        if(!notification){
            return new Response(JSON.stringify({ message : 'No such notification exists' , ok : false}) , { staus : 400 })
        } 
        notification.read = true
        await notification.save()

        return new Response(JSON.stringify({ message : 'Marked as read' , ok : true}) , { status : 200 })
    } catch (error) {
        console.log(error)
    }
}