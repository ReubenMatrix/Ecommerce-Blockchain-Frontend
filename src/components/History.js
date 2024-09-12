import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';

function History() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        // Check if MetaMask is installed and connected
        if (typeof window.ethereum !== 'undefined') {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const userAddress = localStorage.getItem('metaMaskAccount');

          if (!userAddress) {
            throw new Error('MetaMask account not found in local storage.');
          }

          const response = await axios.get(`http://localhost:5000/user-payments/${userAddress}`);
          setPayments(response.data);
          setLoading(false);
        } else {
          throw new Error('MetaMask is not installed');
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to fetch payment history. Please make sure MetaMask is installed and connected.');
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-orange-500 h-full">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      {payments.length === 0 ? (
        <p>No payment history found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.paymentId} className="bg-white p-4 rounded-lg shadow-md">
              <div className="lg:flex-row flex-col items-center justify-between border-b border-gray-200 pb-2 mb-2">
                <div>
                  <p><strong>Product ID:</strong> {payment.productId}</p>
                  <p><strong>Amount:</strong> {payment.amount} ETH</p>
                </div>
                <a href={`https://etherscan.io/tx/${payment.transactionHash}`} className='border-orange-400 1px-solid' target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {payment.transactionHash}
                </a>
              </div>
              <p><strong>Date:</strong> {new Date(payment.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
