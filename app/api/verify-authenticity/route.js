import connectDB from "@/config/database";
import User from "@/models/User";

export const POST = async (reqeust) => {
  const data = await reqeust.json();
  try {

    const { codeforcesHandle , problem , email } = data

    if (!codeforcesHandle || !problem) {
      return new Response(
        JSON.stringify({ message: "Fill all the fields", ok: false }),
        {
          status: 400,
        }
      );
    }

    const check_user_2 = await fetch(
      `https://codeforces.com/api/user.info?handles=${codeforcesHandle.toLowerCase()}&checkHistoricHandles=false`
    ).then(async (data) => await data.json());

    if (check_user_2.status == "FAILED") {
      return new Response(
        JSON.stringify({
          message: `Codeforces handle ${codeforcesHandle} is incorrect`,
          ok: false,
        }),
        { status: 400 }
      );
    }

    //check if CF API is working or not
    const user_status = await fetch(
      `https://codeforces.com/api/user.status?handle=${codeforcesHandle}&count=1`
    ).then(async(data) => await data.json())

    if (user_status.status != "OK") {
      return new Response(
        JSON.stringify({
          message: "Codeforces API is currently down... Please try again later",
          ok: false,
        }),
        { status: 503 }
      );
    }

    //store user's latest submission on Codeforces
    const users_latest_sub = user_status.result[0];

    if (users_latest_sub.problem.contestId != problem.problem.contestId || users_latest_sub.problem.index != problem.problem.index || users_latest_sub.verdict != 'COMPILATION_ERROR') {
      return new Response(
        JSON.stringify({
          message: `You did not submit the required question within 60 seconds`,
          ok: false,
          authentic: false,
        }),
        { status: 422 }
      );
    }

    await connectDB();

    const check_user = await User.find({
      codeforcesId: check_user_2.result[0].handle,
    });
    if (check_user.length > 0) {
      return new Response(
        JSON.stringify({
          message: "This ID has already been taken up by some other user",
          ok: false,
        }),
        { status: 400 }
      );
    }

    //if everything is ok , then save the user in database
    const user = await User.findOne({ email });
    user.codeforcesId = check_user_2.result[0].handle;
    await user.save();

    return new Response(
      JSON.stringify({
        message: "User verified successfully",
        ok: true,
        authentic: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error", ok: false }),
      { status: 500 }
    );
  }
};
