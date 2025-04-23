import Image from 'next/image'
import logo from '@/assets/images/logo2.jpg'
import React from 'react'
import Link from 'next/link'

const Logo = () => {
  return (
    <Link href='/'>
        <div  className='flex gap-3 text-2xl'>
            {/* <Image src={logo} width={25} height={25} alt='logo' /> */}
            <p>Code<span className='text-blue-700 font-semibold'>Sync</span></p>
        </div>
    </Link>
  )
}

export default Logo