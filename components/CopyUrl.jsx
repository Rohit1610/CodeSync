'use client'
import React, { useState } from 'react'
import { FaCheck, FaCopy } from 'react-icons/fa'

const CopyUrl = () => {

  const [copyButtonText, setCopyButtonText] = useState('Copy link to share');
  const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        const contestUrl = window.location.href;
        navigator.clipboard
          .writeText(contestUrl)
          .then(() => {
            setIsCopied(true);
            setCopyButtonText('Copied!');
            setTimeout(() => {
              setIsCopied(false);
              setCopyButtonText('Copy link to share');
            }, 2000);
          })
          .catch((error) => {
            console.error('Failed to copy text: ', error);
          });
      };

  return (
    <div className='mt-10 flex justify-center'>
        <button onClick={handleCopyLink} className='flex items-center text-blue-500 hover:text-blue-700'>
        {isCopied ? (
            <FaCheck className='mr-2' style={{ width: '24px', height: '24px' }} />
        ) : (
            <FaCopy className='mr-2' style={{ width: '24px', height: '24px' }} />
        )}
        {copyButtonText}
        </button>
    </div>
  )
}

export default CopyUrl