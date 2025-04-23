import connectDB from "@/config/database";
import User from "@/models/User";

export const POST = async (request) => {
  const data = await request.json();
  const { codeforcesHandle } = data;

  if (!codeforcesHandle) {
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
        message: `${codeforcesHandle} is an invalid codeforces handle`,
        ok: false,
      }),
      { status: 400 }
    );
  }

  //just to check whether the codeforces API is working fine
  let problems = [];
  try {
    const data = await fetch(
      `https://codeforces.com/api/user.status?handle=${codeforcesHandle}&from=${Math.floor(Math.random() + 2)}`
    ).then(async (res) => await res.json());
    if (data.status != "OK") {
      return new Response(
        JSON.stringify({
          message: "Codeforces API is currently down... Please try again later",
          ok: false,
          APIDown: true,
        }),
        { status: 503 }
      );
    }
    problems = data.result;
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Codeforces API is currently down... Please try again later",
        ok: false,
        APIDown: true,
      }),
      { status: 503 }
    );
  }
  //select a random problem to be asked to the user to submit a compilation error on
  const problem = problems[Math.floor(Math.random() * (problems.length - 1))];

  try {
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

    // const user = await User.findOne({ email });
    // user.codeforcesId = check_user_2.result[0].handle;
    // await user.save();

    return new Response(
      JSON.stringify({
        message: "User to be verified further",
        ok: true,
        problem,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Internal Server error... Please try again",
        ok: false,
      }),
      { status: 500 }
    );
  }
};
