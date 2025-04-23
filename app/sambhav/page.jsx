'use client'
import Head from 'next/head';
import MessageForm from '@/components/MessageForm';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function page() {

  const {data : session} = useSession()
  const router = useRouter()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        !session ||
        !session.user ||
        !session.user.id ||
        session.user.id !== '664da6fa0a207e01f76dfa25'
      ) {
        router.replace('/');
      }
    }, 1000); 

    return () => clearTimeout(timeoutId);
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Head>
        <title>Message Form</title>
        <meta name="description" content="A simple message form created with Next.js and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Submit Your Message</h1>
        <MessageForm />
      </main>
    </div>
  );
}
