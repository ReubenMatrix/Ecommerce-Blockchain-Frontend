import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Web3EcommerceABI from '../Web3EcommerceABI.json';

function AddProduct() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productRating, setProductRating] = useState('');
  const [productImageLink, setProductImageLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          const contractAddress = "0x9438Df9b99AD86C58746a3d324E0e182296E5722";
          const contractInstance = new web3Instance.eth.Contract(
            Web3EcommerceABI,
            contractAddress
          );

          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);
        } catch (error) {
          console.error("Error occurred:", error);
          setError("Failed to connect to MetaMask. Please try again.");
        }
      } else {
        setError('Please install MetaMask to use this application.');
      }
    };

    initWeb3();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      setError("Contract not initialized. Please make sure you're connected to MetaMask.");
      return;
    }

    try {
      setError('');
      setSuccess('');
      await contract.methods.listProduct(
        productName,
        productDescription,
        web3.utils.toWei(productPrice, 'ether'),
        productRating,
        productImageLink
      ).send({ from: account });
      setSuccess('Product added successfully!');
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductRating('');
      setProductImageLink('');
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Error adding product. Please try again.');
    }
  };

  return (
    <div>
      <h2 className='text-bold bg-black text-white'>Add Product</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <textarea
          placeholder="Product Description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product Price (in ETH)"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Product Rating (1-5)"
          min="1"
          max="5"
          value={productRating}
          onChange={(e) => setProductRating(e.target.value)}
        />
        <input
          type="url"
          placeholder="Product Image Link"
          value={productImageLink}
          onChange={(e) => setProductImageLink(e.target.value)}
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;