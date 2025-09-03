import React, { useState } from 'react';
import { ethers } from 'ethers';

const LoanRequestForm = ({ contract, onLoanRequested, account }) => {
  const [loanAmount, setLoanAmount] = useState("");
  const [loanInterest, setLoanInterest] = useState("");
  const [loanDuration, setLoanDuration] = useState("");

  const handleRequestLoan = async () => {
    if (!contract) {
      alert("Wallet not connected.");
      return;
    }
    if (!loanAmount || !loanInterest || !loanDuration) {
      alert("Please fill out all loan request fields.");
      return;
    }
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const hardhatChainId = '0x7A69';
    const hardhatChainIdDecimal = '0x' + (31337).toString(16);
    
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
      onLoanRequested(); // Trigger the refresh in the parent component
    } catch (error) {
      console.error("Failed to request loan:", error);
      alert("Error requesting loan: " + (error.reason || error.message || error));
    }
  };

  return (
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
  );
};

export default LoanRequestForm;