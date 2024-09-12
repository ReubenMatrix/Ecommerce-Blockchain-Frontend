// CustomHomepage.jsx
import React from 'react';

const Home = ({ onConnect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to BlockBazaar</h1>
      <p className="text-lg mb-6">
        Connect your MetaMask wallet to explore our blockchain marketplace.
      </p>
      <button
        onClick={onConnect}
        className="bg-black text-white px-4 py-2 rounded-lg transition"
      >
        Connect MetaMask
      </button>
    </div>
  );
};

export default Home;
