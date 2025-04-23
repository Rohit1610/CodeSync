'use client'
import Spinner from '@/components/Spinner';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from "react-toastify";

// Dynamically import with SSR disabled
const RatingGraph = dynamic(() => import("@/components/RatingGraph"), {
    ssr: false,
});
const BarChart = dynamic(() => import("@/components/MedianRatingChange"), {
    ssr: false,
});
const QuestionTimeGraph = dynamic(
    () => import("@/components/QuestionTimeGraph"),
    { ssr: false }
);
const AverageRankGraph = dynamic(() => import("@/components/AverageRank"), {
    ssr: false,
});

const page = () => {

  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [xPoints, setXPoints] = useState([]);
  const [yPoints, setYPoints] = useState([]);
  const [division, setDivision] = useState([]);
  const [ratingChange, setRatingChange] = useState([]);
  const [questionIndex, setQuestionIndex] = useState([]);
  const [timeTaken, setTimeTaken] = useState([]);
  const [division2, setDivision2] = useState([]);
  const [avgRank, setAvgRank] = useState([]);
  const [graphCFHandle, setGraphCFHandle] = useState("");
  const [changeGraphCFHandle , setChangeGraphCFHandle] = useState(false)
  const router = useRouter();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchUserCfId = async (userId) => {
      if (!userId || hasFetched.current) {
        setLoading(false);
        return;
      }
      if (session.codeforcesId === "") {
        router.push("/provide-codeforces-handle");
        return;
      }

      try {
        const res = await fetch(`/api/profile/${userId}?graph=true`);
        const data = await res.json();
        if (data.ok || data.APIDown) {
          setXPoints(data.xPoints);
          setYPoints(data.yPoints);
          setDivision(data.division);
          setRatingChange(data.ratingChange);
          setQuestionIndex(data.questionIndex);
          setTimeTaken(data.timeTaken);
          setDivision2(data.division2);
          setAvgRank(data.avgRank);
          setGraphCFHandle(data.codeforcesId);
          hasFetched.current = true; // Mark as fetched
        }
        if (data.APIDown) {
          toast.warn(
            "Codeforces API is currently down... Unable to load graphs"
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserCfId(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session]);

  const changeGraph = async (e) => {
    e.preventDefault()
    setChangeGraphCFHandle(true)
    try {
      const res = await fetch('/api/change-graphs' , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeforcesId : graphCFHandle }),
      })
      const data = await res.json()
      if(data.ok || data.APIDown){
          setXPoints(data.xPoints);
          setYPoints(data.yPoints);
          setDivision(data.division);
          setRatingChange(data.ratingChange);
          setQuestionIndex(data.questionIndex);
          setTimeTaken(data.timeTaken);
          setDivision2(data.division2);
          setAvgRank(data.avgRank);
          if(!data.APIDown){
            toast.success('Graph fetched successfully')
          }
          else{
            toast.error(
              "Codeforces API is currently down... Unable to load graphs"
            );
          }
      }
      else{
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error('Could not plot graphs')
      setGraphCFHandle('')
    }
    finally{
      setChangeGraphCFHandle(false)
    }
  }

  return loading ? (
    <Spinner loading={loading} />
  ) : (
    <section className="bg-blue-50">
      <div className="container m-auto py-10">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
        <h1 className='text-3xl font-bold mb-6 text-center text-pink-700'>
            Codeforces Performance Analysis
        </h1>
        <p className="mb-6 text-gray-600 text-center">
          This page offers key insights into your performance, including rating trends and contest stats.{' '}
          <span className="sm:hidden">
            For better graph <span className="font-semibold text-black">visibility</span>, open this page on a desktop site, in landscape mode, or on a larger screen. 
          </span>
        </p>
        <div className="flex flex-col items-center">
            <div className="flex flex-wrap my-8 md:px-3">
              <label
                htmlFor="graphCFHandle"
                className="w-full mb-2 text-sm text-center font-semibold"
              >
                Enter Codeforces Handle to Plot Graph
              </label>
              <input
                type="text"
                id="graphCFHandle"
                name="codeforcesId3"
                className="w-[350px] max-sm:w-[300px] mx-auto px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center mt-3"
                onChange={(e) => setGraphCFHandle(e.target.value)}
                value={graphCFHandle}
              />
            </div>
            <button
              type="submit"
              className="w-[200px] bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
              disabled = {changeGraphCFHandle}
              onClick={changeGraph}
            >
              {changeGraphCFHandle ? 'Plotting...' : 'Enter'}
            </button>
          </div>
          <div className="mt-10">
            {xPoints.length > 0 && yPoints.length > 0 && (
              <RatingGraph xPoints={xPoints} yPoints={yPoints} />
            )}
          </div>
          <div className="mt-10 pt-7">
            {questionIndex.length > 0 && timeTaken.length > 0 && (
              <QuestionTimeGraph
                questionIndex={questionIndex}
                timeTaken={timeTaken}
              />
            )}
          </div>
          <div className="mt-10 pt-7">
            {division.length > 0 && ratingChange.length > 0 && (
              <BarChart divisions={division} ratingChange={ratingChange} />
            )}
          </div>
          <div className="my-10 pt-7">
            {division2.length > 0 && avgRank.length > 0 && (
              <AverageRankGraph divisions={division2} avgRank={avgRank} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default page