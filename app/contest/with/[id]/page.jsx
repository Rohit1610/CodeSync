'use client';
import ContestCard from '@/components/ContestCard';
import Spinner from '@/components/Spinner';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handle , setHandle] = useState(null)
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchContests = async () => {
      if (session && session.user && session.codeforcesId === '') {
        router.push('/provide-codeforces-handle');
        return;
      }

      if(session && session.codeforcesId != id){
        router.push(`/contest/with/${session.codeforcesId}`)
      }

      try {
        const res = await fetch(`/api/contest/with/${id}`);
        const data = await res.json()
        if (!data.ok) {
          toast.error(data.message);
          return;
        }

        setContests(data.contests);
        setHandle(id)
      } catch (error) {
        console.error(error);
        toast.error('Could not fetch contests');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [id , session]);

  return loading ? (
    <Spinner loading={loading} />
  ) : contests.length === 0 ? (
    <div className='container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md'>
      <h1 className='text-4xl font-bold mb-10 text-center text-pink-700'>
        No Past Contests Found
      </h1>
      <p className='text-lg text-center text-gray-700'>
        There are currently no past contests associated with this ID.
      </p>
      <p className="my-6 text-gray-700 text-center">
        This page allows you to review your past contests, analyze your performance, and track your progress over time. Please note: The contests displayed on this page are created specifically on Code Sync, not on Codeforces. 
      </p>
    </div>
  ) : !session ? (
    <div className="container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md flex justify-center">
      <span className="text-3xl text-pink-700">Please Sign In to View Contests</span>
    </div>) : (
    <div className='container mx-auto my-10'>
      <h1 className='text-4xl font-bold mb-6 text-center text-pink-700'>
        Past Contests of {handle}
      </h1>
      <p className="my-6 text-gray-700 text-center mx-8">
        This page allows you to review your past contests, analyze your performance, and track your progress over time. Please note: The contests displayed on this page are created specifically on Code Sync, not on Codeforces. 
      </p>
      <div className='space-y-4'>
        {contests.map((contest, index) => (
          <ContestCard contest={contest} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Page;
