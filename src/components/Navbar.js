import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate()
   

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-black border-orange-700 px-5 mx-5 rounded-lg lg:px-10 py-6 flex justify-between items-center">
            <a href="/" className="flex items-center">
                <span className="self-center text-orange-500 text-3xl font-semibold whitespace-nowrap">Block Bazaar</span>
            </a>

            <button
                onClick={()=>{
                    navigate('/history')
                }}
                className="inline-flex items-center p-2 text-gray-500 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

            </button>

            <div className="hidden lg:flex lg:items-center">
                <button
                    onClick={() => {
                        navigate('/history')
                    }}
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    Check History
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
