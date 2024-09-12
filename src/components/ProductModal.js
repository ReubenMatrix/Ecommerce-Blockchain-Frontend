import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import { ethers } from 'ethers';
import axios from 'axios';

// ABI and contract address would be imported from a separate file in a real application
import WEB3_ECOMMERCE_ABI from '../Web3EcommerceABI.json';
const WEB3_ECOMMERCE_ADDRESS = '0x9438Df9b99AD86C58746a3d324E0e182296E5722';

const ProductModal = ({ open, handleClose, product }) => {
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [isCreateEMIModalOpen, setIsCreateEMIModalOpen] = useState(false);
  const [tenure, setTenure] = useState(3);
  const [monthlyInstallment, setMonthlyInstallment] = useState(0);
  const [emiPlan, setEmiPlan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (product && product.price) {
      setMonthlyInstallment(product.price / tenure);
    }
  }, [product, tenure]);

  useEffect(() => {
    if (product && product.id && window.ethereum) {
      fetchEMIPlan();
    } else if (!window.ethereum) {
      console.error('Please install MetaMask to use this feature.');
    }
  }, [product]);

  const fetchEMIPlan = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);
      const plan = await contract.getEMIPlan(await signer.getAddress(), product.id);
      setEmiPlan(plan);
    } catch (error) {
      console.error("Error fetching EMI plan:", error);
    }
  };

  const createEMIPlan = async () => {
    try {
      if (!product || !product.id) {
        alert("Product data is missing.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);

      const tx = await contract.createEMIPlan(product.id, tenure, {
        value: ethers.utils.parseEther(monthlyInstallment.toString()),
        gasLimit: 500000,
      });

      await tx.wait();
      alert("EMI plan created successfully!");
      fetchEMIPlan();

      // Store payment details in Redis
      const accountId = localStorage.getItem('metaMaskAccount'); // Get MetaMask ID from local storage
      if (accountId) {
        const response = await axios.post('http://localhost:5000/add-payment', {
          userId: accountId, // Use MetaMask ID
          paymentDetails: {
            productId: product.id,
            amount: monthlyInstallment,
            date: new Date().toISOString(),
            transactionHash: tx.hash,
          },
        });
        console.log(response.data);

        if (response.status === 200) {
          alert('Payment details updated in Redis successfully.');
        } else {
          console.error('Failed to update payment details in Redis:', response.data);
        }
      } else {
        console.error('MetaMask ID not found in local storage.');
      }
    } catch (error) {
      console.error("Error creating EMI plan:", error.data ? error.data.message : error.message);
      alert("Failed to create EMI plan. Please try again.");
    }
  };

  const payInstallment = async () => {
    try {
      if (paymentAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request account access if needed
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);

      const tx = await contract.payInstallment(product.id, {
        value: ethers.utils.parseEther(paymentAmount.toString()),
      });

      await tx.wait();
      alert("Installment paid successfully!");
      fetchEMIPlan(); // Refresh EMI plan details after payment

      // Store payment details in Redis
      const accountId = localStorage.getItem('metaMaskAccount'); // Get MetaMask ID from local storage
      if (accountId) {
        const response = await axios.post('http://localhost:5000/add-payment', {
          userId: accountId, // Use MetaMask ID
          paymentDetails: {
            productId: product.id,
            amount: paymentAmount,
            date: new Date().toISOString(),
            transactionHash: tx.hash,
          },
        });
        console.log(response.data);

        if (response.status === 200) {
          alert('Payment details updated in Redis successfully.');
        } else {
          console.error('Failed to update payment details in Redis:', response.data);
        }
      } else {
        console.error('MetaMask ID not found in local storage.');
      }
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction was rejected by the user.");
      } else if (error.code === -32000) {
        alert("Insufficient funds or gas. Please check your balance.");
      } else {
        console.error("Error paying installment:", error);
        alert("Failed to pay installment. Please try again.");
      }
    }
  };

  const handleOpenNestedModal = () => setIsNestedModalOpen(true);
  const handleCloseNestedModal = () => setIsNestedModalOpen(false);

  const handleOpenCreateEMIModal = () => setIsCreateEMIModalOpen(true);
  const handleCloseCreateEMIModal = () => setIsCreateEMIModalOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/send-whatsapp', {
        name,
        phone,
      });
      console.log('WhatsApp message sent:', response.data);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
  };

  return (
    <>
      {/* Outer Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <Box
          sx={{
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
          className="relative"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex gap-4">
            <img
              src={product?.imageLink || 'default-image.png'}
              alt={product?.name || 'Product Image'}
              className="w-1/2 h-auto object-cover rounded-lg"
            />
            <div className="w-1/2 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4">{product?.name || 'Product Name'}</h2>
                <p className="text-gray-800 font-semibold mb-2">Price: {product?.price || '0'} ETH</p>
                <p className="text-gray-600 mb-4">{product?.description || 'Product Description'}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleOpenCreateEMIModal}
                  className="bg-black text-white py-2 px-4 rounded-lg"
                >
                  EMI Plan
                </button>
                <button
                  onClick={handleOpenNestedModal}
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg"
                >
                  Pay EMI
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="mt-4"
            >
              Send Message
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Create EMI Modal */}
      <Modal
        open={isCreateEMIModalOpen}
        onClose={handleCloseCreateEMIModal}
        className="flex items-center justify-center p-4"
      >
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
          className="relative"
        >
          <button
            onClick={handleCloseCreateEMIModal}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-4">Create EMI Plan</h2>
          <div>
            <TextField
              label="Tenure (months)"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={tenure}
              onChange={(e) => setTenure(parseInt(e.target.value, 10))}
            />
            <TextField
              label="Monthly Installment (ETH)"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={monthlyInstallment}
              onChange={(e) => setMonthlyInstallment(parseFloat(e.target.value))}
            />
            <Button
              onClick={createEMIPlan}
              variant="contained"
              color="primary"
              className="mt-4"
            >
              Create Plan
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Pay EMI Modal */}
      <Modal
        open={isNestedModalOpen}
        onClose={handleCloseNestedModal}
        className="flex items-center justify-center p-4"
      >
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
          className="relative"
        >
          <button
            onClick={handleCloseNestedModal}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-4">Pay EMI</h2>
          <TextField
            label="Payment Amount (ETH)"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
          />
          <Button
            onClick={payInstallment}
            variant="contained"
            color="primary"
            className="mt-4"
          >
            Pay
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default ProductModal;









// import React, { useState, useEffect } from 'react';
// import { Modal, Box, TextField, Button } from '@mui/material';
// import { ethers } from 'ethers';
// import axios from 'axios';

// // ABI and contract address would be imported from a separate file in a real application
// import WEB3_ECOMMERCE_ABI from '../Web3EcommerceABI.json';
// const WEB3_ECOMMERCE_ADDRESS = '0x9438Df9b99AD86C58746a3d324E0e182296E5722';

// const ProductModal = ({ open, handleClose, product, currentUser }) => {
//   const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
//   const [isCreateEMIModalOpen, setIsCreateEMIModalOpen] = useState(false);
//   const [tenure, setTenure] = useState(3);
//   const [monthlyInstallment, setMonthlyInstallment] = useState(0);
//   const [emiPlan, setEmiPlan] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState(0);
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');

//   useEffect(() => {
//     if (product && product.price) {
//       setMonthlyInstallment(product.price / tenure);
//     }
//   }, [product, tenure]);

//   useEffect(() => {
//     if (product && product.id && window.ethereum) {
//       fetchEMIPlan();
//     } else if (!window.ethereum) {
//       console.error('Please install MetaMask to use this feature.');
//     }
//   }, [product]);

//   const fetchEMIPlan = async () => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);
//       const plan = await contract.getEMIPlan(await signer.getAddress(), product.id);
//       setEmiPlan(plan);
//     } catch (error) {
//       console.error("Error fetching EMI plan:", error);
//     }
//   };


//   const createEMIPlan = async () => {
//     try {
//       if (!product || !product.id) {
//         alert("Product data is missing.");
//         return;
//       }
  
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);
  
//       const tx = await contract.createEMIPlan(product.id, tenure, {
//         value: ethers.utils.parseEther(monthlyInstallment.toString()),
//         gasLimit: 500000,
//       });
  
//       // Wait for the transaction to be mined
//       await tx.wait();
//       alert("EMI plan created successfully!");
      
//       // Fetch the updated EMI plan
//       fetchEMIPlan();

//       const metaMaskAddress = localStorage.getItem('metaMaskAccount');

  
//       // Send transaction details to the backend
//       const response = await axios.post('http://localhost:5000/add-payment', {
//         userId: metaMaskAddress,
//         paymentDetails: {
//           productId: product,
//           amount: monthlyInstallment,
//           date: new Date().toISOString(),
//           transactionHash: tx.hash,
//         },
//       });
  
//       if (response.status === 200) {
//         alert('Payment details updated in Redis successfully.');
//       } else {
//         console.error('Failed to update payment details in Redis:', response.data);
//       }
//     } catch (error) {
//       console.error("Error creating EMI plan:", error.data ? error.data.message : error.message);
//       alert("Failed to create EMI plan. Please try again.");
//     }
//   };
  



//   const payInstallment = async () => {
//     try {
//       if (paymentAmount <= 0) {
//         alert("Please enter a valid payment amount.");
//         return;
//       }

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       await provider.send("eth_requestAccounts", []); // Request account access if needed
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);

//       const tx = await contract.payInstallment(product.id, {
//         value: ethers.utils.parseEther(paymentAmount.toString()),
//       });

//       await tx.wait();
//       alert("Installment paid successfully!");
//       fetchEMIPlan(); // Refresh EMI plan details after payment

//       const response = await axios.post('http://localhost:5000/add-payment', {
//         userId: currentUser.id,
//         paymentDetails: {
//           productId: product.name,
//           amount: paymentAmount,
//           date: new Date().toISOString(),
//           transactionHash: tx.hash,
//         },
//       });
//       console.log(response.data)

//       if (response.status === 200) {
//         alert('Payment details updated in Redis successfully.');
//       } else {
//         console.error('Failed to update payment details in Redis:', response.data);
//       }
//     } catch (error) {
//       if (error.code === 4001) {
//         alert("Transaction was rejected by the user.");
//       } else if (error.code === -32000) {
//         alert("Insufficient funds or gas. Please check your balance.");
//       } else {
//         console.error("Error paying installment:", error);
//         alert("Failed to pay installment. Please try again.");
//       }
//     }
//   };

//   const handleOpenNestedModal = () => setIsNestedModalOpen(true);
//   const handleCloseNestedModal = () => setIsNestedModalOpen(false);

//   const handleOpenCreateEMIModal = () => setIsCreateEMIModalOpen(true);
//   const handleCloseCreateEMIModal = () => setIsCreateEMIModalOpen(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/send-whatsapp', {
//         name,
//         phone,
//       });
//       console.log('WhatsApp message sent:', response.data);
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//     }
//   };

//   return (
//     <>
//       {/* Outer Modal */}
//       <Modal
//         open={open}
//         onClose={handleClose}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 600,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//             maxHeight: '80vh',
//             overflowY: 'auto',
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleClose}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <div className="flex gap-4">
//             <img
//               src={product?.imageLink || 'default-image.png'}
//               alt={product?.name || 'Product Image'}
//               className="w-1/2 h-auto object-cover rounded-lg"
//             />
//             <div className="w-1/2 flex flex-col justify-between">
//               <div>
//                 <h2 className="text-3xl font-bold mb-4">{product?.name || 'Product Name'}</h2>
//                 <p className="text-gray-800 font-semibold mb-2">Price: {product?.price || '0'} ETH</p>
//                 <p className="text-gray-600 mb-4">{product?.description || 'Product Description'}</p>
//               </div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={handleOpenCreateEMIModal}
//                   className="bg-black text-white py-2 px-4 rounded-lg"
//                 >
//                   EMI Plan
//                 </button>
//                 <button
//                   onClick={handleOpenNestedModal}
//                   className="bg-orange-500 text-white py-2 px-4 rounded-lg"
//                 >
//                   Pay EMI
//                 </button>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="mt-4">
//             <TextField
//               label="Name"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <TextField
//               label="Phone Number"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//             <Button type="submit" variant="contained" className="mt-4">
//               Send
//             </Button>
//           </form>
//         </Box>
//       </Modal>

//       {/* Nested Modal for EMI Payment */}
//       <Modal
//         open={isNestedModalOpen}
//         onClose={handleCloseNestedModal}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 400,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleCloseNestedModal}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <h2 className="text-2xl font-bold mb-4">EMI Payment Details</h2>
//           {!emiPlan ? (
//             <div>
//               <h3>Create New EMI Plan</h3>
//               <label>
//                 Tenure (months):
//                 <input 
//                   type="number" 
//                   value={tenure} 
//                   onChange={(e) => setTenure(Number(e.target.value))}
//                   min="1"
//                   max="12"
//                 />
//               </label>
//               <p>Monthly Installment: {monthlyInstallment.toFixed(4)} ETH</p>
//               <button onClick={createEMIPlan}>Create EMI Plan</button>
//             </div>
//           ) : (
//             <div>
//               <h3>Existing EMI Plan</h3>
//               <p>Remaining Amount: {emiPlan.remainingAmount ? ethers.utils.formatEther(emiPlan.remainingAmount) : '0'} ETH</p>
//               <p>Monthly Installment: {emiPlan.monthlyInstallment ? ethers.utils.formatEther(emiPlan.monthlyInstallment) : '0'} ETH</p>
//               <TextField
//                 label="Amount to Pay"
//                 type="number"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(Number(e.target.value))}
//               />
//               <Button onClick={payInstallment} variant="contained" color="primary">
//                 Pay Installment
//               </Button>
//             </div>
//           )}
//         </Box>
//       </Modal>

//       {/* Nested Modal for Creating EMI Plan */}
//       <Modal
//         open={isCreateEMIModalOpen}
//         onClose={handleCloseCreateEMIModal}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 400,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleCloseCreateEMIModal}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <h2 className="text-2xl font-bold mb-4">Create EMI Plan</h2>
//           <TextField
//             label="Tenure (Months)"
//             variant="outlined"
//             fullWidth
//             margin="normal"
//             type="number"
//             value={tenure}
//             onChange={(e) => setTenure(parseInt(e.target.value))}
//           />
//           <p className="text-gray-700">Monthly Installment: {monthlyInstallment.toFixed(2)} ETH</p>
//           <Button
//             onClick={createEMIPlan}
//             variant="contained"
//             color="primary"
//             className="mt-4"
//           >
//             Create EMI Plan
//           </Button>
//         </Box>
//       </Modal>
//     </>
//   );
// };

// export default ProductModal;















// import React, { useState, useEffect } from 'react';
// import { Modal, Box, TextField, Button } from '@mui/material';
// import { ethers } from 'ethers';
// import axios from 'axios';

// // ABI and contract address would be imported from a separate file in a real application
// import WEB3_ECOMMERCE_ABI from '../Web3EcommerceABI.json';
// const WEB3_ECOMMERCE_ADDRESS = '0x9438Df9b99AD86C58746a3d324E0e182296E5722';

// const ProductModal = ({ open, handleClose, product, currentUser }) => {
//   const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
//   const [isCreateEMIModalOpen, setIsCreateEMIModalOpen] = useState(false);
//   const [tenure, setTenure] = useState(3);
//   const [monthlyInstallment, setMonthlyInstallment] = useState(0);
//   const [emiPlan, setEmiPlan] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState(0);
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');

//   useEffect(() => {
//     setMonthlyInstallment(product.price / tenure);
//   }, [product.price, tenure]);

//   useEffect(() => {
//     if (window.ethereum) {
//       fetchEMIPlan();
//     } else {
//       console.error('Please install MetaMask to use this feature.');
//     }
//   }, [product.id]);

//   const fetchEMIPlan = async () => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);
//       const plan = await contract.getEMIPlan(await signer.getAddress(), product.id);
//       setEmiPlan(plan);
//     } catch (error) {
//       console.error("Error fetching EMI plan:", error);
//     }
//   };

//   const createEMIPlan = async () => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);

//       const tx = await contract.createEMIPlan(product.id, tenure, {
//         value: ethers.utils.parseEther(monthlyInstallment.toString()),
//         gasLimit: 500000, // Ensure sufficient gas
//       });

//       await tx.wait();
//       alert("EMI plan created successfully!");
//       fetchEMIPlan();




//     } catch (error) {
//       console.error("Error creating EMI plan:", error.data ? error.data.message : error.message);
//       alert("Failed to create EMI plan. Please try again.");
//     }
//   };

//   const payInstallment = async () => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       await provider.send("eth_requestAccounts", []); // Request account access if needed
//       const signer = provider.getSigner();
//       const contract = new ethers.Contract(WEB3_ECOMMERCE_ADDRESS, WEB3_ECOMMERCE_ABI, signer);

//       if (paymentAmount <= 0) {
//         alert("Please enter a valid payment amount.");
//         return;
//       }

//       const tx = await contract.payInstallment(product.id, {
//         value: ethers.utils.parseEther(paymentAmount.toString()),
//       });

//       await tx.wait();
//       alert("Installment paid successfully!");
//       fetchEMIPlan(); // Refresh EMI plan details after payment

//       const response = await axios.post('http://localhost:5000/add-payment', {
//         userId: currentUser.id,
//         paymentDetails: {
//           productId: product.name,
//           amount: paymentAmount,
//           date: new Date().toISOString(),
//           transactionHash: tx.hash,
//         },
//       });

//       console.log(response.data)



//       if (response.status === 200) {
//         alert('Payment details updated in Redis successfully.');
//       }else{
//         console.error('Failed to update payment details in Redis:', response.data);
//       }
//     } catch (error) {
//       if (error.code === 4001) {
//         alert("Transaction was rejected by the user.");
//       } else if (error.code === -32000) {
//         alert("Insufficient funds or gas. Please check your balance.");
//       } else {
//         console.error("Error paying installment:", error);
//         alert("Failed to pay installment. Please try again.");
//       }
//     }
//   };

//   const handleOpenNestedModal = () => setIsNestedModalOpen(true);
//   const handleCloseNestedModal = () => setIsNestedModalOpen(false);

//   const handleOpenCreateEMIModal = () => setIsCreateEMIModalOpen(true);
//   const handleCloseCreateEMIModal = () => setIsCreateEMIModalOpen(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/send-whatsapp', {
//         name,
//         phone,
//       });
//       console.log('WhatsApp message sent:', response.data);
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//     }
//   };

//   return (
//     <>
//       {/* Outer Modal */}
//       <Modal
//         open={open}
//         onClose={handleClose}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 600,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//             maxHeight: '80vh',
//             overflowY: 'auto',
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleClose}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <div className="flex gap-4">
//             <img
//               src={product.imageLink}
//               alt={product.name}
//               className="w-1/2 h-auto object-cover rounded-lg"
//             />
//             <div className="w-1/2 flex flex-col justify-between">
//               <div>
//                 <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
//                 <p className="text-gray-800 font-semibold mb-2">Price: {product.price} ETH</p>
//                 <p className="text-gray-600 mb-4">{product.description}</p>
//               </div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={handleOpenCreateEMIModal}
//                   className="bg-black text-white py-2 px-4 rounded-lg"
//                 >
//                   EMI Plan
//                 </button>
//                 <button
//                   onClick={handleOpenNestedModal}
//                   className="bg-orange-500 text-white py-2 px-4 rounded-lg"
//                 >
//                   Pay EMI
//                 </button>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="mt-4">
//             <TextField
//               label="Name"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <TextField
//               label="Phone Number"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//             <Button type="submit" variant="contained" className="mt-4">
//               Send
//             </Button>
//           </form>
//         </Box>
//       </Modal>

//       {/* Nested Modal for EMI Payment */}
//       <Modal
//         open={isNestedModalOpen}
//         onClose={handleCloseNestedModal}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 400,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleCloseNestedModal}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <h2 className="text-2xl font-bold mb-4">EMI Payment Details</h2>
//           {!emiPlan ? (
//             <div>
//               <h3>Create New EMI Plan</h3>
//               <label>
//                 Tenure (months):
//                 <input 
//                   type="number" 
//                   value={tenure} 
//                   onChange={(e) => setTenure(Number(e.target.value))}
//                   min="1"
//                   max="12"
//                 />
//               </label>
//               <p>Monthly Installment: {monthlyInstallment.toFixed(4)} ETH</p>
//               <button onClick={createEMIPlan}>Create EMI Plan</button>
//             </div>
//           ) : (
//             <div>
//               <h3>Existing EMI Plan</h3>
//               <p>Remaining Amount: {ethers.utils.formatEther(emiPlan.remainingAmount)} ETH</p>
//               <p>Monthly Installment: {ethers.utils.formatEther(emiPlan.monthlyInstallment)} ETH</p>
//               <TextField
//                 label="Amount to Pay"
//                 type="number"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(Number(e.target.value))}
//               />
//               <Button onClick={payInstallment} variant="contained" color="primary">
//                 Pay Installment
//               </Button>
//             </div>
//           )}
//         </Box>
//       </Modal>


//       {/* Nested Modal for Creating EMI Plan */}
//       <Modal
//         open={isCreateEMIModalOpen}
//         onClose={handleCloseCreateEMIModal}
//         className="flex items-center justify-center p-4"
//       >
//         <Box
//           sx={{
//             width: 400,
//             bgcolor: 'background.paper',
//             borderRadius: '8px',
//             boxShadow: 24,
//             p: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 4,
//           }}
//           className="relative"
//         >
//           <button
//             onClick={handleCloseCreateEMIModal}
//             className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <h2 className="text-2xl font-bold mb-4">Create EMI Plan</h2>
//           <TextField
//             label="Tenure (Months)"
//             variant="outlined"
//             fullWidth
//             margin="normal"
//             type="number"
//             value={tenure}
//             onChange={(e) => setTenure(parseInt(e.target.value))}
//           />
//           <p className="text-gray-700">Monthly Installment: {monthlyInstallment.toFixed(2)} ETH</p>
//           <Button
//             onClick={createEMIPlan}
//             variant="contained"
//             color="primary"
//             className="mt-4"
//           >
//             Create EMI Plan
//           </Button>
//         </Box>
//       </Modal>
//     </>
//   );
// };

// export default ProductModal;

