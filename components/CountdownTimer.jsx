'use client'
import { useState, useEffect } from 'react'

const CountdownTimer = ({ targetDate, early = false, setCurrentTime }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    } else {
      timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft()
      setTimeLeft(updatedTimeLeft)
      if (early && new Date() >= new Date(targetDate)) {
        setCurrentTime(new Date())
        clearInterval(timer)
      }
    }, 1000)

    // Ensure initial update when component mounts
    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate, early, setCurrentTime])

  const timerComponents = []

  Object.keys(timeLeft).forEach(interval => {
    if (!timeLeft[interval]) {
      return
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} <span>{interval} </span>
      </span>
    )
  })

  return (
    <div className='text-2xl mt-10'>
      {timerComponents.length ? (
        early ? (
          <>
            <p className='mb-2'>Contest starts in:</p>
            <span>{timerComponents}</span>
          </>
        ) : (
          <>
            <p className='mb-2'>Time remaining:</p>
            <span>{timerComponents}</span>
          </>
        )
      ) : (
        <>
          {early ? (
            <span className='text-gray-900'>Contest has started!</span>
          ) : (
            <>
              <span className='text-gray-900'>Contest over</span>
              {targetDate && <p className='text-gray-900 mt-2'>Ended at: {new Date(targetDate).toLocaleString()}</p>}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CountdownTimer
