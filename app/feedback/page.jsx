"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import StarRating from "@/components/StarRating"; // Ensure the correct path to your StarRating component
import { useRouter } from "next/navigation";

const FeedbackPage = () => {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0); // Initialize rating as 0
  const [loading, setLoading] = useState(true);
  const [click , setClick] = useState(false)
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setClick(true)
    const body = feedback.trim();
    const id = session?.user?.id;

    if (!body) {
      toast.error("Fill the required fields")
      setClick(false)
      return;
    }

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id , body , rating }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success(result.message);
        router.push("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback.");
    }
    finally{
      setClick(false)
    }
  };

  return loading ? (
    <Spinner loading={loading} />
  ) : !session ? (
    <div className="flex mt-10 justify-center h-screen">
      <span className="text-3xl text-pink-700">
        Please Sign In to provide feedback
      </span>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-700">
        Submit Feedback
      </h1>
      <p className="text-center text-gray-600 mb-4">
      Experiencing issues or need assistance? Share your feedback or concerns here, and we'll get back to you ASAP.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap">
          <label htmlFor="feedback" className="w-full mb-1 text-sm font-medium">
            Your Feedback / Complaint:
          </label>
          <textarea
            id="feedback"
            name="feedback"
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="flex flex-col items-center">
          <label
            htmlFor="rating"
            className="w-full mb-1 text-sm font-medium text-center"
          >
            Rate Our Website (optional):
          </label>
          <StarRating rating={rating} setRating={setRating} />

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 mt-5"
            disabled={click}
          >
            {click ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackPage;
