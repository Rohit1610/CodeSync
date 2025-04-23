import connectDB from "@/config/database";
import { unwantedContests } from "@/constants/questions";
import Team from "@/models/Team";
import User from "@/models/User";

export const GET = async (request, { params }) => {
  const url = new URL(request.url);
  const graph = url.searchParams.get("graph");

  const getContestType = (contestName) => {
    if (contestName.includes("Educational")) {
      return "Educational";
    } else if (contestName.includes("Global")) {
      return "Global Round";
    } else if (contestName.includes("Div. 1 + Div. 2")) {
      return "Div. 1 + Div. 2";
    } else if (contestName.includes("Div. 1")) {
      return "Div. 1";
    } else if (contestName.includes("Div. 2")) {
      return "Div. 2";
    } else if (contestName.includes("Div. 3")) {
      return "Div. 3";
    } else if (contestName.includes("Div. 4")) {
      return "Div. 4";
    } else if (contestName.includes("Kotlin")) {
      return "Kotlin Heroes";
    } else if (contestName.includes("ICPC")) {
      return "ICPC Related";
    } else {
      return "Standard Round";
    }
  };

  try {
    await connectDB();
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ message: "Unauthorized", ok: false }),
        { status: 401 }
      );
    }
    const user = await User.findById(id);

    if (!user) {
      return new Response(
        JSON.stringify({ message: "No such user exists", ok: false }),
        { status: 400 }
      );
    }

    const { codeforcesId } = user;

    const teams = await Team.find({
      codeforcesHandles: { $in: [codeforcesId] },
    });

    if (!graph) {
      return new Response(
        JSON.stringify({
          message: "Fetched user profile without graphs",
          ok: true,
          codeforcesId,
          teams,
        }),
        { status: 200 }
      );
    }

    //for rating vs problem count graph creation , collect the x and y coordinates
    let xPoints = [],
      yPoints = [];

    //for division vs median rating change graph
    let division = [],
      ratingChange = [];

    //for question index vs time graph
    let questionIndex = [],
      timeTaken = [];

    //for division vs average rank graph
    let division2 = [],
      avgRank = [];

    try {
      //to avoid CF API bug , use a random number in count parameter
      const rnd = Math.floor(Math.random() * 100) + 100;

      const submissions = await fetch(
        `https://codeforces.com/api/user.status?handle=${codeforcesId}&count=${
          10000 + rnd
        }`
      ).then(async (res) => await res.json());

      let submission_arr = [];
      for (const sub of submissions.result) {
        if (sub.verdict == "OK") {
          submission_arr.push(sub);
        }
      }

      //to sort in ascending order
      submission_arr.reverse();

      //fetch user contests list and add a random number to avoid CF API bug
      const user_contests = await fetch(
        `https://codeforces.com/api/user.rating?handle=${codeforcesId}&count=${
          1000 + rnd
        }`
      ).then(async (res) => await res.json());

      let user_contests_arr = [];
      for (const con of user_contests.result) {
        user_contests_arr.push(con);
      }

      for (let i = 0; i < submission_arr.length; i++) {
        const question_submission_time = submission_arr[i].creationTimeSeconds;
        let most_recent_rating = 0;
        for (let k = 0; k < user_contests_arr.length; k++) {
          if (
            user_contests_arr[k].ratingUpdateTimeSeconds <=
            question_submission_time
          ) {
            most_recent_rating = user_contests_arr[k].newRating;
          } else {
            break;
          }
        }
        xPoints.push(i + 1);
        yPoints.push(most_recent_rating);
      }
      if (user_contests_arr.length > 0) {
        xPoints.push(submission_arr.length);
        yPoints.push(user_contests_arr[user_contests_arr.length - 1].newRating);
      }

      //map for storing division vs median rating change
      const median_rating_change = {};

      //variable to store the contest id of the 20th user contest from last
      let mn_contest_id = 0;
      //variable to store the contest id of the 40th user contest from last
      let mn_contest_id2 = 0;

      if (user_contests_arr.length > 5) {
        for (
          let i = user_contests_arr.length - 1;
          i >= Math.max(5, user_contests_arr.length - 20);
          i--
        ) {
          const contest = user_contests_arr[i];
          const contestType = getContestType(contest.contestName);
          if (!median_rating_change[contestType]) {
            median_rating_change[contestType] = [];
          }
          median_rating_change[contestType].push(
            contest.newRating - contest.oldRating
          );
        }
      }

      Object.entries(median_rating_change).forEach(
        ([contestType, ratingArr]) => {
          division.push(contestType);
          ratingArr.sort((a, b) => a - b); // Sort numerically
          // console.log(contestType , ratingArr)
          ratingChange.push(ratingArr[Math.floor([ratingArr.length / 2])]);
        }
      );

      //map for storing the problems solved in a particular contest to be used for generating the average time taken graph
      const map2 = {};

      if (user_contests_arr.length > 0) {
        mn_contest_id =
          user_contests_arr[Math.max(0, user_contests_arr.length - 20)]
            .contestId;
        mn_contest_id2 =
          user_contests_arr[Math.max(0, user_contests_arr.length - 40)]
            .contestId;
      }

      for (const sub of submission_arr) {
        //filter only the first accepted submissions of a user on any problem of a contest which is not older than the 40th contest from last for the user
        if (
          sub.author.participantType == "CONTESTANT" &&
          sub.verdict == "OK" &&
          sub.problem.contestId >= mn_contest_id2 &&
          !unwantedContests.includes(sub.contestId)
        ) {
          if (!map2[sub.contestId]) {
            map2[sub.contestId] = [];
          }
          //to ensure that there may not be multiple correct submissions against the same problem during the contest
          let flag = 1;
          for (const temp_sub of map2[sub.contestId]) {
            if (temp_sub.problem.index == sub.problem.index) {
              flag = 0;
            }
          }
          if (flag) {
            map2[sub.contestId].push(sub);
          }
        }
      }

      //map for storing the submission time corresponding to a particular question rating
      const map3 = new Map();
      const map4 = new Map();

      Object.entries(map2).forEach(([contestId, submissions]) => {
        //for now , just consider contests upto the 20th contest from last.. if later , we find that the sample size of data for any particular question rating is less , then we will fetch upto the 40th contest from last
        if (submissions[0].problem.rating && contestId >= mn_contest_id) {
          let prevTime = submissions[0].author.startTimeSeconds;

          //to handle the case when the contest contains easy and hard version of the same question , the time for the hard version should be the sum of time for easy version and hard version.
          let time_for_easy_version = -1;

          for (let k = 0; k < submissions.length; k++) {
            const sub = submissions[k];
            if (sub.problem.index.length == 2 && sub.problem.index[1] == "1") {
              time_for_easy_version = prevTime;
            }
            map3.set(
              sub.problem.rating,
              (map3.get(sub.problem.rating) || 0) +
                sub.creationTimeSeconds -
                (sub.problem.index.length == 2 &&
                sub.problem.index[1] == "2" &&
                time_for_easy_version != -1
                  ? time_for_easy_version
                  : prevTime)
            );
            prevTime = sub.creationTimeSeconds;
            map4.set(
              sub.problem.rating,
              (map4.get(sub.problem.rating) || 0) + 1
            );
          }
        }
      });

      //list to store the frequency of the questions as per their ratings so that we can find the median frequency and TRY to have all questions frequency above the median frequency even if we have to cross the bar of the "20th contest from last" , we can go upto 40
      let freq = [];
      map4.forEach((value, key) => {
        freq.push(value);
      });

      freq.sort((a, b) => a - b);

      let median_freq = freq[Math.floor(freq.length / 2)];
      Object.entries(map2).forEach(([contestId, submissions]) => {
        //to ensure that we are not double counting
        if (
          submissions[0].problem.rating &&
          contestId < mn_contest_id &&
          contestId >= mn_contest_id2
        ) {
          let prevTime = submissions[0].author.startTimeSeconds;

          //to handle the case when the contest contains easy and hard version of the same question , the time for the hard version should be the sum of time for easy version and hard version.
          let time_for_easy_version = -1;

          for (let k = 0; k < submissions.length; k++) {
            const sub = submissions[k];
            if (!map4.get(sub.problem.rating)) {
              map4.set(sub.problem.rating, 0);
            }

            //if we have sufficient data then we won't consider the data from past as it will most probably increase the avg time taken of question which may not represent properly the current capability of the user
            if (map4.get(sub.problem.rating) > median_freq) {
              if (
                sub.problem.index.length == 2 &&
                sub.problem.index[1] == "1"
              ) {
                // console.log(sub.problem.rating)
                time_for_easy_version = prevTime;
                // console.log(time_for_easy_version , prevTime)
              }
              prevTime = sub.creationTimeSeconds;
              continue;
            }
            map3.set(
              sub.problem.rating,
              (map3.get(sub.problem.rating) || 0) +
                sub.creationTimeSeconds -
                (sub.problem.index.length == 2 &&
                sub.problem.index[1] == "2" &&
                time_for_easy_version != -1
                  ? time_for_easy_version
                  : prevTime)
            );
            prevTime = sub.creationTimeSeconds;
            map4.set(
              sub.problem.rating,
              (map4.get(sub.problem.rating) || 0) + 1
            );
          }
        }
      });

      // map3.forEach((value, key) => {
      //   questionIndex.push(key);
      //   timeTaken.push(Math.floor(value / (map4.get(key) * 60)));
      // });

      //to insert sorted questionIndex
      const data = [];
      map3.forEach((value, key) => {
        data.push({
          questionIndex: key,
          timeTaken: Math.floor(value / (map4.get(key) * 60)),
        });
      });

      data.sort((a, b) => a.questionIndex - b.questionIndex);
      questionIndex = data.map((item) => item.questionIndex);
      timeTaken = data.map((item) => item.timeTaken);

      //maps for storing the avg rank against each division
      const map5 = new Map();
      const map6 = new Map();
      if (user_contests_arr.length > 0) {
        for (
          let i = user_contests_arr.length - 1;
          i >= Math.max(0, user_contests_arr.length - 20);
          i--
        ) {
          const con = user_contests_arr[i];
          const contestType = getContestType(con.contestName);
          map5.set(contestType, (map5.get(contestType) || 0) + con.rank);
          map6.set(contestType, (map6.get(contestType) || 0) + 1);
        }
      }

      map5.forEach((value, key) => {
        division2.push(key);
        avgRank.push(Math.floor(value / map6.get(key)));
      });
    } catch (error) {
      console.log(error);
      console.log("Codeforces API is currently down... Please try again later");
      return new Response(
        JSON.stringify({
          message: "Codeforces API is currently down... Please try again later",
          ok: false,
          codeforcesId,
          APIDown: true,
          teams,
          xPoints,
          yPoints,
          division,
          ratingChange,
          questionIndex,
          timeTaken,
          division2,
          avgRank,
        }),
        { status: 503 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "User details found along with graphs",
        ok: true,
        codeforcesId,
        teams,
        xPoints,
        yPoints,
        division,
        ratingChange,
        questionIndex,
        timeTaken,
        division2,
        avgRank,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Unable to fetch profile", ok: false }),
      { status: 500 }
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    await connectDB();
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ message: "Unauthorized", ok: false }),
        { status: 401 }
      );
    }
    const user = await User.findById(id);

    if (!user) {
      return new Response(
        JSON.stringify({ message: "No such user exists", ok: false }),
        { status: 400 }
      );
    }

    const data = await request.json();
    user.codeforcesId = data.codeforcesId;

    await user.save();

    return new Response(
      JSON.stringify({ message: "ID updated successfully", ok: true }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Could not update ID", ok: false }),
      { status: 500 }
    );
  }
};
