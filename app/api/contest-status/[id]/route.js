import connectDB from "@/config/database";
import Contest from "@/models/Contest";


export const GET = async (request, { params }) => {
    try {
    await connectDB();

    const { id } = params;

    const contest = await Contest.findById(id)

    const common_questions = new Set([])

    const num = Math.floor(Math.random() * 1000) + 10000

    for(const contestant of contest.contestants){
        const submissions = await fetch(`https://codeforces.com/api/user.status?handle=${contestant}&count=${num}`).then(async(data) => await data.json())
        for(const submission of submissions.result){
            if(submission.verdict == 'OK'){
                common_questions.add(`${submission.problem.contestId}${submission.problem.index}`)
            }
        }
    }

    const solved = []
    contest.problemList.map((problem) => {
        if(common_questions.has(`${problem.contestId}${problem.index}`)){
            solved.push(problem)
        }
    })

    return new Response(JSON.stringify({ message : 'Question status fetched' , ok : true , solved }), { status : 200 })
        
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message : 'Could not fetch contest status' , ok : false}), { status : 500 })
    }
}