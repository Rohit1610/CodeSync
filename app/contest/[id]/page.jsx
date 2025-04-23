'use client'
import CopyUrl from '@/components/CopyUrl'
import CountdownTimer from '@/components/CountdownTimer'
import Spinner from '@/components/Spinner'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCheckCircle, FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Page = () => {
  const { id } = useParams();
  const [contestData, setContestData] = useState({});
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEndButtons, setShowEndButtons] = useState(false);
  const { data: session } = useSession(); 
  const [endLoading , setEndLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/contest/${id}`);
        const data = await res.json();
        if (!data.ok) {
          return;
        }
        setContestData(data.contest);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSolved = async () => {
      try {
        const res = await fetch(`/api/contest-status/${id}`);
        const data = await res.json();
        if (data.ok) {
          setSolved(data.solved);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
    fetchSolved();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/contest-status/${id}`);
        const data = await res.json();
        if (data.ok) {
          setSolved(data.solved);
        }
      } catch (error) {
        console.log(error);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEndContest = async () => {
    // Check if session.codeforcesId is in data.contest.contestants array
    if (session && session.codeforcesId && contestData.contestants.includes(session.codeforcesId)) {
      setShowEndButtons(true);
    } else {
      // Handle case where the user is not authorized to end the contest
      console.log('User not authorized to end the contest');
    }
  };

  const handleConfirmEnd = async () => {
    setEndLoading(true)
    try {
      const res = await fetch(`/api/contest/${id}/end`);
      const data = await res.json();
      if (data.ok) {
        setContestData(data.contest);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Failed to end the contest: ', error);
      toast.error('An error occurred while trying to end the contest.');
    } finally {
      setShowEndButtons(false);
      setEndLoading(false)
    }
  };

  const handleCancelEnd = () => {
    setShowEndButtons(false);
  };

  const contestEnded = new Date(contestData.timeEnding) <= currentTime;

  return loading ? (
    <Spinner loading={loading} />
  ) : (
    <div className="container mx-auto px-4 py-10 mt-10 bg-gray-50 border border-pink-100 shadow-md rounded-md mb-7">
      <h1 className='text-4xl text-pink-700 font-bold text-center'>Contest Page</h1>
      <div className='mt-5 mx-auto text-center'>
        {new Date(contestData.timeStart) > currentTime ? (
          <>
          <CountdownTimer early={true} targetDate={new Date(contestData.timeStart)} setCurrentTime={setCurrentTime} />
          <div className='mb-5'>
          <CopyUrl/>
          </div>
          </>
        ) : (
          <>
            <CountdownTimer targetDate={new Date(contestData.timeEnding)} />
            <CopyUrl/>
            <div className='pt-5'>
              {contestData.problemList.map((problem, index) => (
                <div className='flex flex-wrap mt-10 justify-center items-center' key={index}>
                  <Link
                    href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                    className='text-blue-800  p-1 rounded-xl ms-3 underline inline-flex items-center'
                    target='_blank'
                  >
                  <span className='font-semibold mr-3'>{index + 1}. {problem.name}</span>
                    <FaExternalLinkAlt/>
                  </Link>
                  {solved.some(solvedProblem =>
                    solvedProblem.contestId === problem.contestId && solvedProblem.index === problem.index
                  ) && <FaCheckCircle className='text-green-500 ms-2' style={{ width: '24px', height: '24px' }} />}
                </div>
              ))}
            </div>
            {!contestEnded && session && session.codeforcesId && contestData.contestants.includes(session.codeforcesId) && (
              <div className='mt-10 flex justify-center'>
                {showEndButtons ? (
                  <>
                    <button onClick={handleConfirmEnd} className='inline-flex items-center px-4 py-3 bg-red-400 hover:bg-red-500 text-white font-bold rounded-md mr-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'
                    disabled={endLoading}>
                      {endLoading ? 'Wait...' : 'End'}
                    </button>
                    <button onClick={handleCancelEnd} className='inline-flex items-center px-4 py-3 bg-gray-400  text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'
                    disabled={endLoading}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleEndContest} className='inline-flex items-center px-4 py-3 bg-red-400 hover:bg-red-500 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'>
                    End Contest
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Page;