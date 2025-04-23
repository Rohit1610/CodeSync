import connectDB from "@/config/database"
import Contest from "@/models/Contest"


export const GET = async (request , { params }) => {
    try {
        await connectDB()
        const { id } = params
        const contest = await Contest.findById(id)

        if(!contest){
            return new Response(JSON.stringify({
                message : 'No such contest exists' , ok : false
            }) , { status : 400 })
        }

        return new Response(JSON.stringify({ message : 'Found the contest' , ok : true , contest }) , { status : 200 })
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Failed to fetch contest data' , ok : false}) , { status : 500 })
    }
}

