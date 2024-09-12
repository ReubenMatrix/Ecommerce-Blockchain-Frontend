
import React, { useState } from 'react';
import ProductModal from './ProductModal';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const renderStars = () => {
    const totalStars = 5;

    const filledStars = Number(product.rating);
  
    const validStars = Math.min(Math.max(filledStars, 0), totalStars);
  
    return (
      <div className='flex space-x-1'>
        {[...Array(totalStars)].map((_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={index < validStars ? 'currentColor' : 'none'}
            stroke={index < validStars ? '' : 'currentColor'}
            strokeWidth="2"
            className={`w-5 h-5 ${index < validStars ? 'text-yellow-400' : 'text-gray-400'}`}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>
    );
  };
  

  return (
    <>
      <li
        onClick={openModal}
        className="bg-white border-black-[2px] rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer transition-transform transform hover:scale-105"
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.imageLink}
          alt={product.name}
          className="w-32 h-32 object-cover rounded mb-4"
          loading="lazy"
        />
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-900 font-bold mb-2">Price: {product.price} ETH</p>
        {renderStars()}
      </li>

      <ProductModal open={isModalOpen} handleClose={closeModal} product={product} />
    </>
  );
};

export default ProductCard;



