'use client'
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function MessageForm() {
  const [message, setMessage] = useState('');
  const [id , setId] = useState('')
  const [clicked , setClicked] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClicked(true)
    // Handle form submission logic here
    try {
        
        const res = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id , message }),
          });

          const data = await res.json()
          if(!data.ok){
            toast.error(data.message)
          }
          else{
            setId('')
            setMessage('')
            toast.success(data.message)
          }

    } catch (error) {
        console.log(error)
        toast.error('Client side error')
    }
    finally{
        setClicked(false)
    }

  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
    <div className="mb-4">
      <label htmlFor="id" className="block text-gray-700 font-bold mb-2">
        Your ID
      </label>
      <input
        id="id"
        name="id"
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your ID here..."
        required
      />
    </div>
    <div className="mb-4">
      <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
        Your Message
      </label>
      <textarea
        id="message"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your message here..."
        required
      ></textarea>
    </div>
    <button
      type="submit"
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      disabled = {clicked}
    >
      {clicked ? 'Sending...' : 'Send'}
    </button>
  </form>
  );
}
