import React from 'react'
import Logo from './Logo'
import NavItems from './NavItems'

const Navbar = () => {
  return (
    <nav className='bg-gray-300 p-6 border-b border-pink-100'>
        <div className='flex justify-around'>
            <div className=''>
                <Logo/>
            </div>
            <div>
                <NavItems/>
            </div>
        </div>
    </nav>
  )
}

export default Navbar