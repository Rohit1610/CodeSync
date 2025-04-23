import connectDB from "@/config/database";
import Team from '@/models/Team';
import { getSessionUser } from "@/utils/getSessionUser";

export const POST = async (request) => {
    try {
        await connectDB();

        const session = await getSessionUser();

        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized', ok: false
            }), { status: 401 });
        }

        const data = await request.json();
        const { ids, teamName } = data;

        if (!ids || !teamName || ids.length === 0) {
            return new Response(JSON.stringify({ message: 'Required fields not provided', ok: false }), { status: 400 });
        }

        const uniqueIds = [...new Set(ids)];
        if (uniqueIds.length !== ids.length) {
            return new Response(JSON.stringify({ message: 'Duplicate Codeforces handles are not allowed', ok: false }), { status: 400 });
        }

        let codeforcesHandles = [];

        for (const id of ids) {
            const user = await fetch(`https://codeforces.com/api/user.info?handles=${id}&checkHistoricHandles=false`).then(async (data) => await data.json());
            if (user.status === 'FAILED') {
                return new Response(JSON.stringify({ message: `Could not find the handle ${id}`, ok: false }), { status: 400 });
            }
            codeforcesHandles.push(user.result[0].handle);
        }

        if (codeforcesHandles.length < 2) {
            return new Response(JSON.stringify({ message: 'Please provide at least 2 members', ok: false }), { status: 400 });
        }

        // Check if a team with the same codeforcesHandles already exists
        let existingTeam = await Team.findOne({ codeforcesHandles: { $all: codeforcesHandles, $size: codeforcesHandles.length } });

        if (existingTeam) {
            return new Response(JSON.stringify({
                message: `The team ${existingTeam.teamName} with the same members already exists`, ok: false
            }), { status: 400 });
        }

        existingTeam = await Team.findOne({ 
            teamName,
            codeforcesHandles: { $in: [codeforcesHandles[0]] } 
        });

        if (existingTeam) {
            return new Response(JSON.stringify({
                message: `Team name ${teamName} already exists... Try a different one`, ok: false
            }), { status: 400 });
        }

        const team = new Team({
            teamName,
            codeforcesHandles
        });

        await team.save();

        return new Response(JSON.stringify({
            message: 'Team added successfully', ok: true, team
        }), { status: 200 });

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ message: 'Server error... Please try again', ok: false }), { status: 500 });
    }
};
