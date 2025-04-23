"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

const ProvideCodeforcesHandle = () => {
  const timeAlloted = 60;
  const { data: session } = useSession();
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [taskUrl, setTaskUrl] = useState("");
  const [problem, setProblem] = useState({});
  const [authenticityChecked, setAuthenticityChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [timer, setTimer] = useState(timeAlloted);
  const [timerActive, setTimerActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session && session.user && session.codeforcesId !== "") {
      router.push("/");
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    let countdown;
    if (timerActive && timer > 0) {
      countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && timerActive) {
      verifyAuthenticity();
    }
    return () => clearTimeout(countdown);
  }, [timerActive, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/provide-codeforces-handle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeforcesHandle }),
      });
      const data = await res.json();
      if (!data.ok && data.APIDown) {
        toast.warn("Codeforces API is currently down... Unable to load graphs");
      } else if (data.ok && data.problem) {
        toast.success("Please verify your identity by submitting the question");
        setProblem(data.problem);
        setTaskUrl(
          `https://codeforces.com/contest/${data.problem.problem.contestId}/submit/${data.problem.problem.index}`
        );
        setTimerActive(true);
        setTimer(timeAlloted);
        setAuthenticityChecked(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("There was an error verifying the user. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const verifyAuthenticity = async () => {
    try {
      const res = await fetch("/api/verify-authenticity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          codeforcesHandle,
          problem,
        }),
      });
      const data = await res.json();
      setAuthenticityChecked(true);
      if (data.ok && data.authentic) {
        toast.success("Your Codeforces handle has been verified successfully!");
        session.codeforcesId = codeforcesHandle;
        router.push("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error during verification. Please try again.");
    } finally {
      setTimerActive(false);
    }
  };

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (!session) {
    return (
      <div className="flex mt-10 justify-center h-screen">
        <span className="text-3xl text-pink-700">Please sign in first</span>
      </div>
    );
  }

  if (taskUrl && !authenticityChecked) {
    return (
      <div className="container mx-auto px-10 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-pink-700 text-center">
          Verification Required
        </h1>
        <p className="mt-5 text-gray-600 text-center">
          Please click on the link below and submit and wait for a{" "}
          <span className="font-bold">compilation error</span> to verify your
          Codeforces ID.
        </p>
        <div className="mt-10 text-center">
          <Link
            href={taskUrl}
            className="text-blue-800  p-1 rounded-xl ms-3 underline inline-flex items-center text-[22px]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-semibold mr-3">{problem.problem.name}</span>
            <FaExternalLinkAlt />
          </Link>
        </div>
        {/* <div className="mt-[65px] text-center">
          <button
            onClick={() => {
              setVerificationLoading(true);
              setTimeout(() => {
                verifyAuthenticity();
              }, 1500);
            }}
            className="inline-flex items-center px-3 py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 font-medium"
            disabled={verificationLoading}
          >
            {verificationLoading
              ? "Verifying..."
              : "I have submitted the question"}
          </button>
        </div> */}

        {timerActive && (
          <p className="mt-8 text-gray-600 text-center">
            Automatic verification in{" "}
            <span className="font-bold text-xl">{timer} seconds...</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md">
      <h1 className="text-3xl font-bold text-pink-700 text-center">Welcome!</h1>
      <p className="mt-4 text-gray-600 text-center">
        We're excited to have you here. Please provide your Codeforces handle to
        continue and enjoy all the features of our platform.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 text-center">
        <label className="block text-gray-700">
          Codeforces Handle{" "}
          <span className="text-sm text-gray-500">
            (This cannot be changed later)
          </span>
        </label>
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={codeforcesHandle}
            onChange={(e) => setCodeforcesHandle(e.target.value)}
            className="border rounded md:w-1/2 max-sm:w-full py-2 px-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Codeforces handle"
            required
          />
          <button
            type="submit"
            className="mt-5 bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            disabled={submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProvideCodeforcesHandle;
