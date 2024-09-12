import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Web3EcommerceABI from '../Web3EcommerceABI.json';
import ProductCard from './ProductCard';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const contractAddress = "0x9438Df9b99AD86C58746a3d324E0e182296E5722";
          const contractInstance = new web3Instance.eth.Contract(
            Web3EcommerceABI,
            contractAddress
          );

          fetchProducts(contractInstance, web3Instance);
        } catch (error) {
          console.error("Error occurred:", error);
          setError("Failed to connect to MetaMask. Please try again.");
          setLoading(false);
        }
      } else {
        setError('Please install MetaMask to use this application.');
        setLoading(false);
      }
    };

    const fetchProducts = async (contractInstance, web3Instance) => {
      try {
        const productCount = await contractInstance.methods.productCount().call();
        const fetchedProducts = [];

        for (let i = 1; i <= productCount; i++) {
          const product = await contractInstance.methods.getProduct(i).call();
          fetchedProducts.push({
            id: Number(product.id), // Convert BigInt to Number if necessary
            name: product.name,
            description: product.description,
            price: web3Instance.utils.fromWei(product.price, 'ether'),
            seller: product.seller,
            rating: Number(product.rating), // Convert BigInt to Number
            imageLink: product.imageLink
          });
        }

        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please try again.");
        setLoading(false);
      }
    };

    initWeb3();
  }, []);

  if (loading) {
    return <div className='bg-orange-500 w-full max-h-full'>Loading products...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="flex flex-col items-center p-5">
      <h2 className="text-2xl font-bold mb-5">Product List</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;


