import connectDB from "@/config/database";
import { ratings } from "@/constants/formData";
import { unwantedContests } from "@/constants/questions";
import Contest from "@/models/Contest";
import Team from "@/models/Team";
import User from "@/models/User";

export const POST = async (request) => {
  //to round a given number to the nearest multiple of 100 based on probability that leans towards rounding up for larger remainders and rounding down for smaller remainders
  const roundOff = (num) => {
    const remainder = num % 100;
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    // Calculate probability to round up based on remainder
    const probabilityToRoundUp = remainder / 100;

    // If randomValue is less than or equal to the calculated probability, round up
    if (randomValue <= probabilityToRoundUp) {
      return num + (100 - remainder); // Round up
    } else {
      return num - remainder; // Round down
    }
  };

  //to shuffle the final problem list
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (array.length - 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  //just to check whether the codeforces API is working fine
  try {
    const data = await fetch(
      "https://codeforces.com/api/user.info?handles=tourist"
    ).then(async (res) => await res.json());
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        message: "Codeforces API is currently down... Please try again later",
        ok: false,
      }),
      { status: 503 }
    );
  }

  //actual logic for contest creation
  try {
    const data = await request.json();

    await connectDB();

    const {
      codeforcesId1,
      codeforcesId2,
      codeforcesId3,
      numQuestions,
      lowerDifficulty,
      upperDifficulty,
      timeLimit,
      shuffleOrder,
      tags,
      contestantType,
      selectedTeam,
      startsIn,
      startYear,
      chooseDifficulty,
      diffArr,
    } = data;

    if (
      !codeforcesId1 ||
      !numQuestions ||
      !timeLimit ||
      shuffleOrder == undefined ||
      !tags ||
      !contestantType ||
      !startsIn ||
      !startYear
    ) {
      return new Response(
        JSON.stringify({ message: "Fill all the fields", ok: false }),
        {
          status: 400,
        }
      );
    }

    if (
      chooseDifficulty == "false" ||
      chooseDifficulty == "distributeRandomly"
    ) {
      if (!lowerDifficulty || !upperDifficulty) {
        return new Response(
          JSON.stringify({ message: "Fill all the fields", ok: false }),
          {
            status: 400,
          }
        );
      }
    } else {
      if (diffArr.length != numQuestions) {
        return new Response(
          JSON.stringify({ message: "Fill all the fields", ok: false }),
          {
            status: 400,
          }
        );
      } else {
        if (diffArr.some((diff) => !ratings.includes(diff))) {
          return new Response(
            JSON.stringify({ message: "Fill in correct format", ok: false }),
            {
              status: 400,
            }
          );
        }
      }
    }

    if (!["2022", "2021", "2020", "2019", "2018"].includes(startYear)) {
      return new Response(
        JSON.stringify({ message: "Requested an invalid year", ok: false }),
        { status: 400 }
      );
    }

    const uniqueHandles = new Set(
      [codeforcesId1, codeforcesId2, codeforcesId3]
        .filter(Boolean)
        .map((id) => id.toLowerCase())
    );

    if (
      uniqueHandles.size !==
      [codeforcesId1, codeforcesId2, codeforcesId3]
        .filter(Boolean)
        .map((id) => id.toLowerCase()).length
    ) {
      return new Response(
        JSON.stringify({
          message: "Duplicate Codeforces handles are not allowed",
          ok: false,
        }),
        { status: 400 }
      );
    }

    let contestants = [];
    if (codeforcesId1 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId1}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }
    if (codeforcesId2 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId2}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }
    if (codeforcesId3 !== "") {
      const user = await fetch(
        `https://codeforces.com/api/user.info?handles=${codeforcesId3}&checkHistoricHandles=false`
      ).then(async (data) => await data.json());
      contestants.push(user.result[0].handle);
    }

    if (contestantType === "Team" && contestants.length < 2) {
      return new Response(
        JSON.stringify({
          message: "In team mode, provide at least 2 participants",
          ok: false,
        }),
        { status: 400 }
      );
    }

    const total_questions = await fetch(
      `https://codeforces.com/api/problemset.problems`
    ).then(async (data) => await data.json());

    if (total_questions.status === "FAILED") {
      return new Response(
        JSON.stringify({ message: "Failed to fetch questions", ok: false }),
        { status: 500 }
      );
    }

    const classified_questions = {};
    total_questions.result.problems.forEach((problem) => {
      if (!classified_questions[problem.rating]) {
        classified_questions[problem.rating] = [];
      }
      classified_questions[problem.rating].push(problem);
    });

    //use a random number to avoid CF API bugs
    let num = Math.floor(Math.random() * 1000) + 10000;

    const user1_from_cf_submissions = await fetch(
      `https://codeforces.com/api/user.status?handle=${codeforcesId1}&count=${num}`
    ).then(async (data) => await data.json());

    if (user1_from_cf_submissions.status === "FAILED") {
      return new Response(
        JSON.stringify({
          message: `Codeforces handle ${codeforcesId1} is invalid`,
          ok: false,
        }),
        { status: 400 }
      );
    }

    //to store the common solved questions
    const st = new Set();

    user1_from_cf_submissions.result.forEach((problem) => {
      st.add(`${problem.problem.contestId}${problem.problem.index}`);
    });

    if (codeforcesId2 !== "") {
      num = Math.floor(Math.random() * 1000) + 10000;
      const user2_from_cf_submissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${codeforcesId2}&count=${num}`
      ).then(async (data) => await data.json());

      if (user2_from_cf_submissions.status === "FAILED") {
        return new Response(
          JSON.stringify({
            message: `Codeforces handle ${codeforcesId2} is invalid`,
            ok: false,
          }),
          { status: 400 }
        );
      }

      user2_from_cf_submissions.result.forEach((problem) => {
        st.add(`${problem.problem.contestId}${problem.problem.index}`);
      });
    }

    if (codeforcesId3 !== "") {
      num = Math.floor(Math.random() * 1000) + 10000;
      const user3_from_cf_submissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${codeforcesId3}&count=${num}`
      ).then(async (data) => await data.json());

      if (user3_from_cf_submissions.status === "FAILED") {
        return new Response(
          JSON.stringify({
            message: `Codeforces handle ${codeforcesId3} is invalid`,
            ok: false,
          }),
          { status: 400 }
        );
      }

      user3_from_cf_submissions.result.forEach((problem) => {
        st.add(`${problem.problem.contestId}${problem.problem.index}`);
      });
    }

    //this list will be returned back to the client which contains all the questions fetched for the contest
    let newList = [];
    const startTime = Date.now();
    const timeLimitMillis = 10000;
    let count = 0;

    if (chooseDifficulty == "false") {
      //signifies the range of the lower limit of the question rating, since we are considering only the range [rating_start , rating_start + delta(discussed below)], also rating_start will be incremented by delta in every iteration of the outer while loop
      let rating_start = lowerDifficulty;

      //to store the value by which the range of the question rating would increment
      const delta = (upperDifficulty - lowerDifficulty) / numQuestions;

      //the outer while loop
      while (newList.length < numQuestions) {
        //calculate the upper limit of question rating to be found in this iteration of the outer while loop
        const rating_end = Math.min(
          upperDifficulty,
          100 * Math.ceil((rating_start + delta) / 100)
        );

        //to terminate when it is taking too much time
        if (Date.now() - startTime > timeLimitMillis) {
          return new Response(
            JSON.stringify({
              message: "Time limit exceeded while fetching questions",
              ok: false,
            }),
            { status: 408 }
          );
        }

        //we will first create a pool of question for this range of rating and then take the question having median rating to be added in the final list(namely -> newList)
        let problem_list_for_this_range = [];

        //we will select random questions in the range [rating_start , rating_end] for (temp_size) number of times.. this means higher the temp_size, higher will be the probability to converge towards the mean of the rating range, which will benefit us to avoid abrupt changes in the problem ratings in the final list (newList)
        let temp_size = Math.floor(Math.random() * 3) + 1;

        while (problem_list_for_this_range.length < temp_size) {
          //to randomly select the question rating in the range [rating_start , rating_end]
          const rating_of_question = Math.min(
            upperDifficulty,
            roundOff(Math.floor(Math.random() * delta) + Number(rating_start))
          );

          //randomly select an index for the rating
          let index = Math.floor(
            Math.random() * classified_questions[rating_of_question].length
          );

          let problem = classified_questions[rating_of_question][index];

          while (
            !(
              !st.has(`${problem.contestId}${problem.index}`) &&
              problem.rating <= upperDifficulty &&
              problem.rating >= lowerDifficulty &&
              problem.tags.some((tag) => tags.includes(tag)) &&
              !newList.includes(problem) &&
              !unwantedContests.includes(problem.contestId) &&
              !problem_list_for_this_range.includes(problem)
            ) &&
            count < 100000
          ) {
            //keep updating the index
            index = Math.floor(
              Math.random() * classified_questions[rating_of_question].length
            );

            problem = classified_questions[rating_of_question][index];

            //to keep a track of the number of iterations
            count++;
          }

          //to handle the case when the user has solved most of the questions and we are unable to fetch questions for the chosen criteria
          if (count >= 100000) {
            return new Response(
              JSON.stringify({
                message:
                  "Majority of the matching questions solved. Please adjust criteria for new questions",
                ok: false,
              }),
              {
                status: 200,
              }
            );
          }
          if (startYear == "2022" && problem.contestId >= 1621) {
            problem_list_for_this_range.push(problem);
          } else if (startYear == "2021" && problem.contestId >= 1472) {
            problem_list_for_this_range.push(problem);
          } else if (startYear == "2020" && problem.contestId >= 1284) {
            problem_list_for_this_range.push(problem);
          } else if (startYear == "2019" && problem.contestId >= 1097) {
            problem_list_for_this_range.push(problem);
          } else if (startYear == "2018" && problem.contestId >= 912) {
            problem_list_for_this_range.push(problem);
          }
        }

        //insert the median element of the given rating range in the final list to have a better probability of converging to the average
        problem_list_for_this_range.sort((a, b) => a.rating - b.rating);
        newList.push(
          problem_list_for_this_range[
            Math.floor(problem_list_for_this_range.length / 2)
          ]
        );

        rating_start = Number(rating_start) + Number(delta);
      }
    } else if (chooseDifficulty == "true") {
      while (newList.length < numQuestions) {
        //to terminate when it is taking too much time
        if (Date.now() - startTime > timeLimitMillis) {
          return new Response(
            JSON.stringify({
              message: "Time limit exceeded while fetching questions",
              ok: false,
            }),
            { status: 408 }
          );
        }

        //to handle the case when the user has solved most of the questions and we are unable to fetch questions for the chosen criteria
        if (count >= 100000) {
          return new Response(
            JSON.stringify({
              message:
                "Majority of the matching questions solved. Please adjust criteria for new questions",
              ok: false,
            }),
            {
              status: 200,
            }
          );
        }

        const rating_of_question = diffArr[newList.length];

        //randomly select an index for the rating
        let index = Math.floor(
          Math.random() * classified_questions[rating_of_question].length
        );

        let problem = classified_questions[rating_of_question][index];

        while (
          !(
            !st.has(`${problem.contestId}${problem.index}`) &&
            problem.tags.some((tag) => tags.includes(tag)) &&
            !newList.includes(problem) &&
            !unwantedContests.includes(problem.contestId)
          ) &&
          count < 100000
        ) {
          //keep updating the index
          index = Math.floor(
            Math.random() * classified_questions[rating_of_question].length
          );

          problem = classified_questions[rating_of_question][index];

          //to keep a track of the number of iterations
          count++;
        }
        if (startYear == "2022" && problem.contestId >= 1621) {
          newList.push(problem);
        } else if (startYear == "2021" && problem.contestId >= 1472) {
          newList.push(problem);
        } else if (startYear == "2020" && problem.contestId >= 1284) {
          newList.push(problem);
        } else if (startYear == "2019" && problem.contestId >= 1097) {
          newList.push(problem);
        } else if (startYear == "2018" && problem.contestId >= 912) {
          newList.push(problem);
        }
      }
    } else if (chooseDifficulty == "distributeRandomly") {
      //the outer while loop
      while (newList.length < numQuestions) {
        //to terminate when it is taking too much time
        if (Date.now() - startTime > timeLimitMillis) {
          return new Response(
            JSON.stringify({
              message: "Time limit exceeded while fetching questions",
              ok: false,
            }),
            { status: 408 }
          );
        }

        const rating_of_question =
          roundOff(Math.random() * (upperDifficulty - lowerDifficulty)) +
          parseInt(lowerDifficulty);
        //randomly select an index for the rating
        let index = Math.floor(
          Math.random() * classified_questions[rating_of_question].length
        );

        let problem = classified_questions[rating_of_question][index];

        while (
          !(
            !st.has(`${problem.contestId}${problem.index}`) &&
            problem.rating <= upperDifficulty &&
            problem.rating >= lowerDifficulty &&
            problem.tags.some((tag) => tags.includes(tag)) &&
            !newList.includes(problem) &&
            !unwantedContests.includes(problem.contestId)
          ) &&
          count < 100000
        ) {
          //keep updating the index
          index = Math.floor(
            Math.random() * classified_questions[rating_of_question].length
          );

          problem = classified_questions[rating_of_question][index];

          //to keep a track of the number of iterations
          count++;
        }

        //to handle the case when the user has solved most of the questions and we are unable to fetch questions for the chosen criteria
        if (count >= 100000) {
          return new Response(
            JSON.stringify({
              message:
                "Majority of the matching questions solved. Please adjust criteria for new questions",
              ok: false,
            }),
            {
              status: 200,
            }
          );
        }
        if (startYear == "2022" && problem.contestId >= 1621) {
          newList.push(problem);
        } else if (startYear == "2021" && problem.contestId >= 1472) {
          newList.push(problem);
        } else if (startYear == "2020" && problem.contestId >= 1284) {
          newList.push(problem);
        } else if (startYear == "2019" && problem.contestId >= 1097) {
          newList.push(problem);
        } else if (startYear == "2018" && problem.contestId >= 912) {
          newList.push(problem);
        }
      }
    }

    if (!shuffleOrder && chooseDifficulty != "true") {
      newList.sort((a, b) => a.rating - b.rating);
    } else if (shuffleOrder) {
      shuffle(newList);
    }

    let users = [];

    for (const contestant of contestants) {
      const user = await User.findOne({ codeforcesId: contestant });
      if (user) {
        users.push(user);
      }
    }

    let now = new Date();
    if (startsIn != "Immediately") {
      now = new Date(now.getTime() + startsIn * 60000);
    }
    const newDate = new Date(now.getTime() + timeLimit * 60000);

    let teamId = selectedTeam;
    if (!teamId || teamId === "" || teamId === "Select Team") {
      teamId = undefined;
    }

    const contest = new Contest({
      users,
      problemList: newList,
      contestants,
      numberOfQuestions: numQuestions,
      lowerLimit: data.lowerDifficulty ? data.lowerDifficulty : undefined,
      upperLimit: data.upperDifficulty ? data.upperDifficulty : undefined,
      timeLimit,
      timeStart: now.toISOString(),
      timeEnding: newDate.toISOString(),
      contestantType,
      team: teamId ? teamId : undefined,
      distributeRandomly:
        data.chooseDifficulty == "distributeRandomly" ? true : false,
      chooseDifficulty: data.chooseDifficulty == "true" ? true : false,
      diffArr: data.chooseDifficulty != "false" ? diffArr : undefined,
      startYear,
    });

    await contest.save();

    const id = contest._id;

    return new Response(
      JSON.stringify({ message: "Contest created", id, ok: true }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Failed to create a contest", ok: false }),
      { status: 500 }
    );
  }
};
