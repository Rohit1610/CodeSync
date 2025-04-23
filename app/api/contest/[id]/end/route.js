import connectDB from "@/config/database"
import Contest from "@/models/Contest"
import { getSessionUser } from "@/utils/getSessionUser"


export const GET = async (request , { params }) => {
    try {
        
        await connectDB()
        const session = await getSessionUser()
        
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized', ok: false
            }), { status: 401 });
        }
        
        const { id } = params

        const contest = await Contest.findById(id)
        if(!contest){
            return new Response(JSON.stringify({ message : 'No such contest exists' , ok : false}) , { status : 400 })
        }

        let flag = 0
        for(const handle of contest.contestants){
            if(handle == session.codeforcesId){
                flag = 1
            }
        }
        if(!flag){
            return new Response(JSON.stringify({
                message: 'Unauthorized', ok: false
            }), { status: 401 });
        }

        const now = new Date()
        contest.timeEnding = now
        await contest.save()
        return new Response(JSON.stringify({ message : 'Contest ended' , ok : true , contest }) , { status : 200 })

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Contest ended successfully!' , ok : false}) , { status : 500 })
    }
}