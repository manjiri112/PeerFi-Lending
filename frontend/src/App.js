import { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import LendingPlatformAbi from "./abi/LendingPlatform.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loanList, setLoanList] = useState([]);
  const [reputation, setReputation] = useState(0);

  const [loanAmount, setLoanAmount] = useState("");
  const [loanInterest, setLoanInterest] = useState("");
  const [loanDuration, setLoanDuration] = useState("");

  useEffect(() => {
    let lendingContract = null;

    async function connect() {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask to use this DApp.");
        return;
      }
      try {
        // Check if we're on the correct network (Hardhat local network)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const hardhatChainId = '0x7A69';  // 31337 in hex
        const hardhatChainIdDecimal = '0x' + (31337).toString(16);  // Alternative format
        
        if (chainId !== hardhatChainId && chainId !== hardhatChainIdDecimal) {
          try {
            // Try to switch to Hardhat network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hardhatChainIdDecimal }],
            });
          } catch (switchError) {
            // If the network is not added, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x7A69',
                      chainName: 'Hardhat Local',
                      rpcUrls: ['http://127.0.0.1:8545'],
                      nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                      },
                    },
                  ],
                });
              } catch (addError) {
                console.error('Error adding Hardhat network:', addError);
                alert('Please add and switch to the Hardhat Local network in MetaMask');
                return;
              }
            } else {
              console.error('Error switching to Hardhat network:', switchError);
              alert('Please switch to the Hardhat Local network in MetaMask');
              return;
            }
          }
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        lendingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LendingPlatformAbi.abi,
          signer
        );
        setContract(lendingContract);

        const rep = await lendingContract.getReputation(userAddress);
        setReputation(Number(rep));

        await loadLoans(lendingContract);

        // Event listeners for real-time updates
        const onLoanRequested = () => {
          console.log("LoanRequested event detected — refreshing loans");
          loadLoans(lendingContract);
        };

        const onLoanFunded = () => {
          console.log("LoanFunded event detected — refreshing loans");
          loadLoans(lendingContract);
        };

        const onLoanRepaid = async () => {
          console.log("LoanRepaid event detected — refreshing loans & reputation");
          loadLoans(lendingContract);
          const updatedRep = await lendingContract.getReputation(userAddress);
          setReputation(Number(updatedRep));
        };

        const onAccountsChanged = async (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const rep = await lendingContract.getReputation(accounts[0]);
            setReputation(Number(rep));
            await loadLoans(lendingContract);
          } else {
            setAccount("");
            setReputation(0);
            setLoanList([]);
          }
        };

        const onChainChanged = () => window.location.reload();

        // Add event listeners
        lendingContract.on("LoanRequested", onLoanRequested);
        lendingContract.on("LoanFunded", onLoanFunded);
        lendingContract.on("LoanRepaid", onLoanRepaid);
        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

      } catch (error) {
        console.error("MetaMask connection or contract loading error:", error);
      }
    }

    connect();

    // Cleanup function to remove event listeners
    return () => {
      if (lendingContract) {
        lendingContract.removeAllListeners("LoanRequested");
        lendingContract.removeAllListeners("LoanFunded");
        lendingContract.removeAllListeners("LoanRepaid");
      }
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  async function loadLoans(lendingContract) {
    if (!lendingContract) return;
    try {
      const ids = await lendingContract.getAllLoanIds();
      const loansTemp = [];
      for (const id of ids) {
        try {
          const loan = await lendingContract.loans(id);
          // Validate all required fields exist
          if (loan && 
              loan.borrower && 
              loan.amount && 
              typeof loan.funded === 'boolean' && 
              typeof loan.repaid === 'boolean') {
            // Ensure amount and interest are valid BigNumbers
            const validAmount = ethers.getBigInt(loan.amount);
            const validInterest = ethers.getBigInt(loan.interest || 0);
            
            loansTemp.push({ 
              id: Number(id),
              borrower: loan.borrower,
              lender: loan.lender,
              amount: validAmount,
              interest: validInterest,
              funded: loan.funded,
              repaid: loan.repaid
            });
          }
        } catch (loanError) {
          console.error(`Error loading loan ${id}:`, loanError);
          // Continue with next loan if one fails
          continue;
        }
      }
      setLoanList(loansTemp);
    } catch (error) {
      console.error("Failed to load loans:", error);
      setLoanList([]); // Reset to empty list on error
    }
  }

  async function handleRequestLoan() {
    if (!contract) {
      alert("Wallet not connected.");
      return;
    }
    if (!loanAmount || !loanInterest || !loanDuration) {
      alert("Please fill out all loan request fields.");
      return;
    }

    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const hardhatChainId = '0x7A69';  // 31337 in hex
    const hardhatChainIdDecimal = '0x' + (31337).toString(16);  // Alternative format
    
    if (chainId !== hardhatChainId && chainId !== hardhatChainIdDecimal) {
      alert("Please switch to the Hardhat Local network in MetaMask");
      return;
    }
    try {
      const amount = ethers.parseEther(loanAmount);
      const interest = ethers.parseEther(loanInterest);
      const durationSeconds = Number(loanDuration);

      const tx = await contract.requestLoan(amount, interest, durationSeconds);
      await tx.wait();

      alert("Loan requested successfully!");
      setLoanAmount("");
      setLoanInterest("");
      setLoanDuration("");
    } catch (error) {
      console.error("Failed to request loan:", error);
      alert("Error requesting loan: " + (error.reason || error.message || error));
    }
  }

  async function handleFundLoan(loanId, amount) {
    if (!contract) {
      alert("Wallet not connected.");
      return;
    }
    
    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const hardhatChainId = '0x7A69';  // 31337 in hex
    const hardhatChainIdDecimal = '0x' + (31337).toString(16);  // Alternative format
    
    if (chainId !== hardhatChainId && chainId !== hardhatChainIdDecimal) {
      alert("Please switch to the Hardhat Local network in MetaMask");
      return;
    }

    try {
      console.log("Attempting to fund loan", loanId, "with amount:", amount.toString());
      
      // Get the loan details to verify the amount
      const loan = await contract.loans(loanId);
      console.log("Loan details:", loan);
      
      // Verify the amount matches the loan amount
      if (loan.amount.toString() !== amount.toString()) {
        console.error("Amount mismatch:", {
          required: loan.amount.toString(),
          provided: amount.toString()
        });
        alert("Internal amount mismatch. Please try again.");
        return;
      }

      const tx = await contract.fundLoan(loanId, { 
        value: amount,
        gasLimit: 100000 // Explicit gas limit
      });
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Refresh the loans list
      await loadLoans(contract);
      alert("Loan funded successfully!");
    } catch (error) {
      console.error("Failed to fund loan:", error);
      if (error.reason) {
        alert("Error: " + error.reason);
      } else if (error.data?.message) {
        alert("Error: " + error.data.message);
      } else {
        alert("Failed to fund loan. See console for details.");
      }
    }
  }

  async function handleRepayLoan(loanId, totalAmount) {
    if (!contract) {
      alert("Wallet not connected.");
      return;
    }
    
    // Check if we're on the correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const hardhatChainId = '0x7A69';  // 31337 in hex
    const hardhatChainIdDecimal = '0x' + (31337).toString(16);  // Alternative format
    
    if (chainId !== hardhatChainId && chainId !== hardhatChainIdDecimal) {
      alert("Please switch to the Hardhat Local network in MetaMask");
      return;
    }

    try {
      // Get the loan details to calculate the exact repayment amount
      const loan = await contract.loans(loanId);
      const repaymentAmount = loan.amount + loan.interest;
      
      console.log("Repayment details:", {
        loanId,
        principal: ethers.formatEther(loan.amount),
        interest: ethers.formatEther(loan.interest),
        total: ethers.formatEther(repaymentAmount)
      });

      const tx = await contract.repayLoan(loanId, { 
        value: repaymentAmount,
        gasLimit: 100000 // Explicit gas limit
      });
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Refresh the loans list and reputation
      await loadLoans(contract);
      const updatedRep = await contract.getReputation(account);
      setReputation(Number(updatedRep));
      
      alert("Loan repaid successfully!");
    } catch (error) {
      console.error("Failed to repay loan:", error);
      if (error.reason) {
        alert("Error: " + error.reason);
      } else if (error.data?.message) {
        alert("Error: " + error.data.message);
      } else {
        alert("Failed to repay loan. See console for details.");
      }
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Decentralized P2P Lending Platform</h1>
      </header>

      {!account ? (
        <div className="wallet-connect">
          <button className="button" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="main-content">
          <div className="account-info-container">
            <p>
              Connected Account: <b className="account-address">{account}</b>
            </p>
            <p>Reputation Score: <span className="reputation-score">{reputation}</span></p>
          </div>

          <section className="request-loan-section">
            <h2>Request a New Loan</h2>
            <div className="form-container">
              <input
                className="input-field"
                type="text"
                placeholder="Loan Amount (ETH)"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              <input
                className="input-field"
                type="text"
                placeholder="Interest Amount (ETH)"
                value={loanInterest}
                onChange={(e) => setLoanInterest(e.target.value)}
              />
              <input
                className="input-field"
                type="number"
                placeholder="Duration (seconds)"
                value={loanDuration}
                onChange={(e) => setLoanDuration(e.target.value)}
              />
              <button className="button request-button" onClick={handleRequestLoan}>
                Request Loan
              </button>
            </div>
          </section>

          <section className="loans-section">
            <h2>Loans</h2>
            {loanList.length === 0 ? (
              <p>No loans available</p>
            ) : (
              <div className="table-responsive">
                <table className="loan-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Borrower</th>
                      <th>Lender</th>
                      <th>Amount (ETH)</th>
                      <th>Interest (ETH)</th>
                      <th>Funded</th>
                      <th>Repaid</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanList.map(
                      ({ id, borrower, lender, amount, interest, funded, repaid }) => {
                        // Convert BigInt values to strings for display
                        const amountEth = amount ? ethers.formatEther(amount.toString()) : "0";
                        const interestEth = interest ? ethers.formatEther(interest.toString()) : "0";
                        const canFund = !funded && !repaid && borrower?.toLowerCase() !== account.toLowerCase();
                        const canRepay = funded && !repaid && borrower?.toLowerCase() === account.toLowerCase();

                        // Format amounts for display
                        const displayAmount = parseFloat(amountEth).toFixed(4);
                        const displayInterest = parseFloat(interestEth).toFixed(4);
                        
                        return (
                          <tr key={id}>
                            <td>{id}</td>
                            <td title={borrower}>{`${borrower?.slice(0, 6)}...${borrower?.slice(-4)}`}</td>
                            <td title={lender}>{lender === ethers.ZeroAddress ? "-" : `${lender?.slice(0, 6)}...${lender?.slice(-4)}`}</td>
                            <td>{displayAmount}</td>
                            <td>{displayInterest}</td>
                            <td>{funded ? "Yes" : "No"}</td>
                            <td>{repaid ? "Yes" : "No"}</td>
                            <td className="action-cell">
                              {canFund && (
                                <button 
                                  className="button fund-button" 
                                  onClick={() => {
                                    console.log('Funding loan with amount:', amount.toString());
                                    handleFundLoan(id, amount);
                                  }}
                                  title={`Fund this loan with ${displayAmount} ETH`}
                                >
                                  Fund Loan ({displayAmount} ETH)
                                </button>
                              )}
                              {canRepay && (
                                <button 
                                  className="button repay-button" 
                                  onClick={() => handleRepayLoan(id)}
                                  title={`Repay loan with ${displayAmount} ETH + ${displayInterest} ETH interest`}
                                >
                                  Repay Loan ({(parseFloat(displayAmount) + parseFloat(displayInterest)).toFixed(4)} ETH)
                                </button>
                              )}
                              {!canFund && !canRepay && <span>-</span>}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
