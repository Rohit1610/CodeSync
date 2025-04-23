import connectDB from "@/config/database"
import Contest from "@/models/Contest"
import User from "@/models/User"


export const GET = async (request , { params }) => {
    try {
        await connectDB()
        const { id } = params
        if(!id){
            return new Response(JSON.stringify({ message : 'Fill all the fields' , ok : false }) , { status : 400 })
        }

        const contests = await Contest.find({ contestants : { $in : [id] } }).sort({ timeStart : -1 })
        
        return new Response(JSON.stringify({ message : 'Found contests' , ok : true , contests }) , { status : 200 })
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Could not fetch contests' }), { status : 500 })
    }
}