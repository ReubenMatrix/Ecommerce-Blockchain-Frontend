// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import Navbar from './components/Navbar';
import Home from './components/Home';
import History from './components/History'; // Import the History component

function App() {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          // Check local storage for the MetaMask address
          const storedAccount = localStorage.getItem('metaMaskAccount');
          if (storedAccount) {
            setIsMetaMaskConnected(true);
            return;
          }

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            localStorage.setItem('metaMaskAccount', accounts[0]);
            setIsMetaMaskConnected(true);
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };

    checkMetaMaskConnection();
  }, []);

  const handleConnectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          localStorage.setItem('metaMaskAccount', accounts[0]);
          setIsMetaMaskConnected(true);
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  return (
    <BrowserRouter>
      <div>
        {isMetaMaskConnected ? (
          <div className='py-3'>
            <Navbar />
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </div>
        ) : (
          <Home onConnect={handleConnectMetaMask} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;






















// // App.js
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import ProductList from './components/ProductList';
// import Navbar from './components/Navbar';
// import Home from './components/Home';
// import History from './components/History'; // Import the History component

// function App() {
//   const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

//   useEffect(() => {
//     const checkMetaMaskConnection = async () => {
//       if (window.ethereum) {
//         try {
//           const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//           setIsMetaMaskConnected(accounts.length > 0);
//         } catch (error) {
//           console.error("Error checking MetaMask connection:", error);
//         }
//       }
//     };

//     checkMetaMaskConnection();
//   }, []);

//   const handleConnectMetaMask = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         if (accounts.length > 0) {
//           setIsMetaMaskConnected(true);
//         }
//       } catch (error) {
//         console.error("Error connecting to MetaMask:", error);
//       }
//     } else {
//       alert('MetaMask is not installed. Please install it to use this app.');
//     }
//   };

//   return (
//     <BrowserRouter>
//       <div>
//         {isMetaMaskConnected ? (
//           <div className='py-3'>
//             <Navbar />
//             <Routes>
//               <Route path="/" element={<ProductList />} />
//               <Route path="/history" element={<History />} />
     
//             </Routes>
//           </div>
//         ) : (
//           <Home onConnect={handleConnectMetaMask} />
//         )}
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;

















