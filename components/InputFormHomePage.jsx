"use client";
import React, { useEffect, useState } from "react";
import { ratings, questions, time, tags } from "@/constants/formData";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "./Spinner";
import { setCookie , getCookie } from "cookies-next";

const InputFormHomePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted , setMounted] = useState(false)
  const [teamLoading, setTeamLoading] = useState(false);
  const [contestantType, setContestantType] = useState(!getCookie("contestantType") ? "Individual" : getCookie("contestantType"));
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [data, setData] = useState({
    codeforcesId1: !getCookie("codeforcesId1") ? "" : getCookie("codeforcesId1"),
    codeforcesId2: !getCookie("codeforcesId2") ? "" : getCookie("codeforcesId2"),
    codeforcesId3: !getCookie("codeforcesId3") ? "" : getCookie("codeforcesId3"),
    numQuestions: !getCookie("numQuestions") ? "6" : getCookie("numQuestions"),
    lowerDifficulty: !getCookie("lowerDifficulty") ? "1000" : getCookie("lowerDifficulty"),
    upperDifficulty: !getCookie("upperDifficulty") ? "1800" : getCookie("upperDifficulty"),
    timeLimit: !getCookie("timeLimit") ? "120" : getCookie("timeLimit"),
    tags: [],
    shuffleOrder: !getCookie("shuffleOrder") ? false : getCookie("shuffleOrder") == "false" ? false : true,
    startsIn: !getCookie("startsIn") ? "Immediately" : getCookie("startsIn"),
    startYear: !getCookie("startYear") ? "2019" : getCookie("startYear"),
    chooseDifficulty: !getCookie("chooseDifficulty") ? "false" : getCookie("chooseDifficulty"),
  });

  const timeDisplay = {
    30: "30 mins",
    60: "1 hr",
    90: "1 hr 30 mins",
    120: "2 hrs",
    150: "2 hrs 30 mins",
    180: "3 hrs",
    210: "3 hrs 30 mins",
    240: "4 hrs",
    270: "4 hrs 30 mins",
    300: "5 hrs",
  };

  useEffect(() => {
    const fetchTeams = async () => {
      if (!session || !session.user) {
        setMounted(true)
        return;
      }
      if (session.user && session.codeforcesId == "") {
        setMounted(true)
        router.push("/provide-codeforces-handle");
        return;
      }
      try {
        const res = await fetch(`/api/profile/${session.user.id}?graph=false`);
        const result = await res.json();
        setTeams(result.teams);
        setData((prevData) => ({
          ...prevData,
          codeforcesId1: result.codeforcesId,
        }));
        setCookie('codeforcesId1' , result.codeforcesId , { maxAge : 60 * 60 * 24 * 120})
      } catch (error) {
        console.log(error);
        toast.error("Could not fetch teams");
      }
      finally{
        setMounted(true)
      }
    };

    fetchTeams();
  }, [session]);

  const handleContestantTypeChange = (e) => {
    setContestantType(e.target.value);
    setCookie("contestantType" , e.target.value , { maxAge : 60 * 60 * 24 * 120})
    if (e.target.value === "Individual") {
      setData((prevData) => ({
        ...prevData,
        codeforcesId2: "",
        codeforcesId3: "",
      }));
    }
  };

  const handleChange = (e, index = null) => {
    const { id, value } = e.target;

    if (index !== null) {
      // Handling the case when chooseDifficulty is not false
      setData((prevData) => ({
        ...prevData,
        [`questionDifficulty_${index}`]: parseInt(value),
      }));
    } else if (id === "tags") {
      const selectedTags = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setData({
        ...data,
        [id]: selectedTags,
      });
    } else if (id === "lowerDifficulty") {
      setCookie("lowerDifficulty" , e.target.value , { maxAge : 60 * 60 * 24 * 120})
      const newUpperDifficulty = Math.max(
        parseInt(value),
        parseInt(data.upperDifficulty)
      );
      setData({
        ...data,
        upperDifficulty: newUpperDifficulty.toString(),
        [id]: value,
      });
    } else {
      setCookie(e.target.id , e.target.value , { maxAge : 60 * 60 * 24 * 120})
      setData({
        ...data,
        [id]: value,
      });
    }
  };

  const handleShuffleChange = (e) => {
    setCookie("shuffleOrder" , !shuffleOrder , { maxAge : 60 * 60 * 24 * 120})
    setData((prevData) => ({
      ...prevData,
      shuffleOrder: !prevData.shuffleOrder,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { checked, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      tags: checked
        ? [...prevData.tags, value]
        : prevData.tags.filter((tag) => tag !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let {
      codeforcesId1,
      codeforcesId2,
      codeforcesId3,
      numQuestions,
      lowerDifficulty,
      upperDifficulty,
      timeLimit,
      shuffleOrder,
      startsIn,
      startYear,
      chooseDifficulty,
    } = data;
    let diffArr = undefined;
    if (chooseDifficulty == "true") {
      diffArr = [];
      lowerDifficulty = undefined;
      upperDifficulty = undefined;
      for (let i = 0; i < numQuestions; i++) {
        diffArr.push(data[`questionDifficulty_${i}`] || 800);
      }
    }
    // console.log(chooseDifficulty)
    const temp = data.tags.length == 0 ? tags : data.tags;
    try {
      const res = await fetch("/api/create-contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codeforcesId1,
          codeforcesId2,
          codeforcesId3,
          numQuestions,
          lowerDifficulty,
          upperDifficulty,
          timeLimit,
          shuffleOrder,
          tags: temp,
          contestantType,
          selectedTeam,
          startsIn,
          startYear,
          chooseDifficulty,
          diffArr,
        }),
      });

      const result = await res.json();
      if (result.ok) {
        toast.success(result.message);
        const id = result.id;
        router.push(`/contest/${id}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (e) => {
    setSelectedTeam(e.target.value);
    const teamId = e.target.value;
    const selectedTeam = teams.find((team) => team?._id === teamId);

    if (selectedTeam) {
      const { codeforcesHandles } = selectedTeam;
      const newHandles = codeforcesHandles.filter(
        (handle) => handle != data.codeforcesId1
      );
      setData((prevData) => ({
        ...prevData,
        codeforcesId2: newHandles[0] || "",
        codeforcesId3: newHandles[1] || "",
      }));
    }
  };

  const handleAddTeamClick = (e) => {
    e.preventDefault();
    setShowAddTeam(!showAddTeam);
  };

  const handleNewTeamNameChange = (e) => {
    setNewTeamName(e.target.value);
  };

  const handleNewTeamSubmit = async (e) => {
    e.preventDefault();
    let ids = [data.codeforcesId1];
    if (data.codeforcesId2 != "") {
      ids.push(data.codeforcesId2);
    }
    if (data.codeforcesId3 != "") {
      ids.push(data.codeforcesId3);
    }
    setTeamLoading(true);
    try {
      const res = await fetch("/api/add-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: newTeamName,
          ids,
        }),
      });

      const result = await res.json();
      if (result.ok) {
        toast.success(result.message);
        setTeams((prevTeams) => [...prevTeams, result.team]);
        setSelectedTeam(result.team);
        setShowAddTeam(false);
        setNewTeamName("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not add team");
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (contestantType === "Team") {
      const matchingTeam = teams.find((team) => {
        const handles = team?.codeforcesHandles;
        const enteredHandles = [
          data.codeforcesId1.toLowerCase(),
          data.codeforcesId2.toLowerCase(),
          data.codeforcesId3.toLowerCase(),
        ].filter(Boolean); // remove empty values
        return (
          handles.length === enteredHandles.length &&
          handles.every((handle) =>
            enteredHandles.includes(handle.toLowerCase())
          )
        );
      });
      if (matchingTeam) {
        setSelectedTeam(matchingTeam._id);
      } else {
        setSelectedTeam("");
      }
    }
  }, [
    data.codeforcesId1,
    data.codeforcesId2,
    data.codeforcesId3,
    teams,
    contestantType,
  ]);

  if(!mounted){
    return <Spinner/>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:mt-5 max-sm:mt-3 bg-gray-50 rounded-lg shadow-lg border border-pink-100 md:mb-3">
      <h1 className="text-3xl font-bold mb-8 text-center text-pink-700">
        Create Custom Contest
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Create custom Codeforces mashup contests with unsolved problems for you
        and your team!
      </p>
      <form className="space-y-6">
        <div className="flex flex-wrap mb-6">
          <label
            htmlFor="contestantType"
            className="w-full mb-2 text-sm font-medium"
          >
            Participation Type
          </label>
          <select
            name="contestantType"
            id="contestantType"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => handleContestantTypeChange(e)}
            value={contestantType}
          >
            <option value={"Team"}>Team</option>
            <option value={"Individual"}>Individual</option>
          </select>
        </div>
        <div className="md:flex md:justify-between space-y-6">
          {contestantType === "Team" && session && (
            <div className="flex flex-wrap md:px-3">
              <label
                htmlFor="teamSelect"
                className="w-full text-sm font-medium mb-2 self-center md:mt-6"
              >
                Choose a Team : (to auto-fill IDs)
              </label>
              <select
                id="teamSelect"
                name="teamSelect"
                className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={handleTeamSelect}
                value={selectedTeam}
              >
                {teams?.length == 0 ? (
                  <option value="Select Team">No teams added yet</option>
                ) : (
                  <option value="Select Team">Select Team</option>
                )}
                {teams.map((team) => (
                  <option key={team?._id} value={team?._id}>
                    {team?.teamName}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(contestantType === "Team" || !session) && (
            <div
              className={`flex flex-wrap md:px-3 mt-6 ${
                contestantType === "Team" ? "md:mb-0" : "md:mb-0"
              }`}
            >
              <label
                htmlFor="codeforcesId1"
                className={`w-full ${
                  session || contestantType == "Individual"
                    ? "mb-2"
                    : "mb-2 self-center"
                } text-sm font-medium`}
              >
                Your Codeforces ID:
              </label>
              <input
                type="text"
                id="codeforcesId1"
                name="codeforcesId1"
                className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={data.codeforcesId1}
                disabled={data.codeforcesId1 != "" && session}
                onChange={handleChange}
              />
            </div>
          )}
          {contestantType === "Team" && (
            <>
              <div className="flex flex-wrap mb-6 md:px-3">
                <label
                  htmlFor="codeforcesId2"
                  className="w-full mb-2 text-sm font-medium"
                >
                  Codeforces ID 2:
                </label>
                <input
                  type="text"
                  id="codeforcesId2"
                  name="codeforcesId2"
                  className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={handleChange}
                  value={data.codeforcesId2}
                />
              </div>

              <div className="flex flex-wrap mb-6 md:px-3">
                <label
                  htmlFor="codeforcesId3"
                  className="w-full mb-2 text-sm font-medium"
                >
                  Codeforces ID 3:
                </label>
                <input
                  type="text"
                  id="codeforcesId3"
                  name="codeforcesId3"
                  className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={handleChange}
                  value={data.codeforcesId3}
                  placeholder="(Optional)"
                />
              </div>
              {selectedTeam === "" &&
                (data.codeforcesId2 !== "" || data.codeforcesId3 !== "") &&
                !showAddTeam &&
                session && (
                  <div className="flex flex-wrap mb-6 md:px-3">
                    <button
                      className="inline-flex items-center px-4 py-3 bg-yellow-500 hover:bg-yellow-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                      onClick={handleAddTeamClick}
                    >
                      Add this team (optional)
                    </button>
                  </div>
                )}
            </>
          )}
        </div>

        {showAddTeam && (
          <div className="md:flex md:justify-start space-y-6">
            <div className="flex flex-wrap mb-6 md:px-3">
              <label
                htmlFor="newTeamName"
                className="w-full mb-2 text-sm font-medium"
              >
                Provide Team Name:
              </label>
              <input
                type="text"
                id="newTeamName"
                name="newTeamName"
                className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newTeamName}
                onChange={handleNewTeamNameChange}
              />
            </div>
            <div className="flex flex-wrap mb-6 md:px-3">
              <button
                className="inline-flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 mt-3"
                onClick={handleNewTeamSubmit}
                disabled={teamLoading}
              >
                {!teamLoading ? <>Add this team</> : <>Loading...</>}
              </button>
              <button
                className="inline-flex items-center mx-3 px-4 py-3 bg-yellow-500 hover:bg-yellow-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 mt-3"
                onClick={handleAddTeamClick}
                disabled={teamLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap mb-6">
          <label
            htmlFor="numQuestions"
            className="w-full mb-2 text-sm font-medium"
          >
            Number of Questions:
          </label>
          <select
            id="numQuestions"
            name="numQuestions"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            value={data.numQuestions}
          >
            {questions.map((question) => (
              <option key={question} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap mb-6">
          <label
            htmlFor="chooseDifficulty"
            className="w-full mb-2 text-sm font-medium"
          >
            Question Difficulty Distribution:
          </label>
          <select
            id="chooseDifficulty"
            name="chooseDifficulty"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            value={data.chooseDifficulty}
          >
            <option value={"false"}>Distribute evenly</option>
            <option value={"distributeRandomly"}>Distribute randomly</option>
            <option value={"true"}>Specify Difficulty for Each Question</option>
          </select>
        </div>

        {data.chooseDifficulty == "false" || data.chooseDifficulty == "distributeRandomly" ? (
          <>
            <div className="flex flex-wrap mb-6">
              <label
                htmlFor="lowerDifficulty"
                className="w-full mb-2 text-sm font-medium"
              >
                Minimum Question Rating:
              </label>
              <select
                id="lowerDifficulty"
                name="lowerDifficulty"
                className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={handleChange}
                value={data.lowerDifficulty}
              >
                {ratings.map((rating) => (
                  <option value={rating} key={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap mb-6">
              <label
                htmlFor="upperDifficulty"
                className="w-full mb-2 text-sm font-medium"
              >
                Maximum Question Rating:
              </label>
              <select
                id="upperDifficulty"
                name="upperDifficulty"
                className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={handleChange}
                value={data.upperDifficulty}
                min={data.lowerDifficulty}
              >
                {ratings.map(
                  (rating) =>
                    rating >= data.lowerDifficulty && (
                      <option value={rating} key={rating}>
                        {rating}
                      </option>
                    )
                )}
              </select>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Please note that the order of the questions fetched will be the
              same as you provided unless they are shuffled later.
            </p>
            {Array.from({ length: data.numQuestions }).map((_, index) => (
              <div className="flex flex-wrap mb-6" key={index}>
                <label
                  htmlFor={`questionDifficulty_${index}`}
                  className="w-full mb-2 text-sm font-medium"
                >
                  Select Difficulty for Question {index + 1}:
                </label>
                <select
                  id={`questionDifficulty_${index}`}
                  name={`questionDifficulty_${index}`}
                  className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => handleChange(e, index)}
                  value={data[`questionDifficulty_${index}`] || ""}
                >
                  {ratings.map((rating) => (
                    <option value={rating} key={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </>
        )}

        <div className="flex flex-wrap mb-6">
          <label
            htmlFor="timeLimit"
            className="w-full mb-2 text-sm font-medium"
          >
            Contest Duration :
          </label>
          <select
            id="timeLimit"
            name="timeLimit"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            value={data.timeLimit}
          >
            {time.map((t) => (
              <option value={t} key={t}>
                {timeDisplay[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap mb-6">
          <label htmlFor="startsIn" className="w-full mb-2 text-sm font-medium">
            Start Time :
          </label>
          <select
            id="startsIn"
            name="timeLimit"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            value={data.startsIn}
          >
            <option value="Immediately">Immediately</option>
            <option value={1}>1 minute from now</option>
            <option value={2}>2 minutes from now</option>
            <option value={5}>5 minutes from now</option>
            <option value={10}>10 minutes from now</option>
          </select>
        </div>

        <div className="flex flex-wrap mb-6">
          <label
            htmlFor="startYear"
            className="w-full mb-2 text-sm font-medium"
          >
            Question Recency :
          </label>
          <select
            id="startYear"
            name="timeLimit"
            className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            value={data.startYear}
          >
            <option value="2022">2022 onward</option>
            <option value="2021">2021 onward</option>
            <option value="2020">2020 onward</option>
            <option value="2019">2019 onward</option>
            <option value="2018">2018 onward</option>
          </select>
        </div>

        <div className="flex flex-wrap mb-6">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              id="shuffleOrder"
              name="tags"
              className="mr-2"
              onChange={handleShuffleChange}
              checked={data.shuffleOrder}
            />
            <label htmlFor="shuffleOrder">Shuffle Question Order</label>
          </div>
        </div>

        <div className="grid grid-cols-6 max-sm:grid-cols-3 max-sm:gap-3 max-md:grid-cols-4 max-md:gap-2 mb-6">
          <label className="col-span-3 text-sm font-medium mb-3">
            Filter Specific Problem Tags: (Leave unchecked if you don't want to
            apply filter)
          </label>
          {tags.map((tag) => (
            <div key={tag} className="flex items-center mb-1">
              <input
                type="checkbox"
                id={tag}
                name="tags"
                value={tag}
                className="mr-2"
                onChange={handleCheckboxChange}
                checked={data.tags.includes(tag)}
              />
              <label htmlFor={tag} className="text-sm">
                {tag}
              </label>
            </div>
          ))}
        </div>

        <button
          className="inline-flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          onClick={handleSubmit}
          disabled={loading}
        >
          {!loading ? <>Create Contest</> : <>Creating ...</>}
        </button>
      </form>
    </div>
  );
};

export default InputFormHomePage;
