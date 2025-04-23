"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import profileDefault from "@/assets/images/profile.png";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
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

const ProfilePage = () => {
  const { data: session } = useSession();
  const profileImage = session?.user?.image;
  const profileName = session?.user?.name;
  const profileEmail = session?.user?.email;

  const [codeforcesId, setCodeforcesId] = useState("Not provided yet");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserCfId = async (userId) => {
      if (!userId) {
        setLoading(false);
        return;
      }
      if (session.codeforcesId === "") {
        router.push("/provide-codeforces-handle");
        return;
      }

      try {
        const res = await fetch(`/api/profile/${userId}`);
        const data = await res.json();
        if (data.ok || data.APIDown) {
          setCodeforcesId(data.codeforcesId);
          setTeams(data.teams);
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

  return loading ? (
    <Spinner loading={loading} />
  ) : !session ? (
    <div className="container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md flex justify-center">
      <span className="text-3xl text-pink-700">
        Please Sign In to View Profile
      </span>
    </div>
  ) : (
    <section className="bg-blue-50">
      <div className="container m-auto py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 md:mx-20 mt-10">
              <div className="mb-4">
                <Image
                  className="h-32 w-32 md:h-48 md:w-48 rounded-full mx-auto md:mx-0"
                  src={profileImage || profileDefault}
                  width={200}
                  height={200}
                  alt="User"
                />
              </div>
              <h2 className="text-2xl mt-7 my-4">
                <span className="font-bold block">Name: </span> {profileName}
              </h2>
              <h2 className="text-2xl">
                <span className="font-bold block">Email: </span> {profileEmail}
              </h2>
            </div>
            <div className="md:w-3/4 md:pl-4 text-xl max-sm:mt-5">
              <div className="mb-4 flex items-center">
                <h3 className="block text-gray-700 font-bold mr-2">
                  Codeforces ID:
                </h3>
                <Link
                  href={
                    codeforcesId != "Not provided yet"
                      ? `https://codeforces.com/profile/${codeforcesId}`
                      : "#"
                  }
                  className="px-5 py-2 text-blue-900 underline"
                  target="_blank"
                >
                  {codeforcesId}
                </Link>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-700">Teams</h3>
                {teams.length === 0 ? (
                  <p className="text-gray-600">No teams available</p>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team._id}
                      className="mb-4 p-4 border rounded bg-gray-50"
                    >
                      <h4 className="text-xl font-bold">{team.teamName}</h4>
                      <p className="text-gray-700">Members:</p>
                      <ul className="list-disc list-inside">
                        {team.codeforcesHandles.map((handle, index) => (
                          <li key={index}>
                            <Link
                              href={`https://codeforces.com/profile/${handle}`}
                              target="_blank"
                              className="text-pink-900 underline"
                            >
                              {handle}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
