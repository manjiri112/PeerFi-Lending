# P2P Lending Platform

A decentralized peer-to-peer lending platform built on the Ethereum blockchain that enables users to request and fund loans with custom terms.

## Features

- Create loan requests with custom amount, interest, and duration
- Fund existing loan requests
- Repay loans with interest
- Track user reputation based on successful repayments
- Real-time updates using blockchain events
- MetaMask integration for secure transactions

## Technology Stack

- Smart Contracts: Solidity (^0.8.20)
- Development Environment: Hardhat
- Frontend: React.js
- Web3 Integration: ethers.js
- Wallet Connection: MetaMask

## Project Structure

```
├── contracts/               # Smart contract source files
│   ├── LendingPlatform.sol # Main lending platform contract
│   └── MockERC20Token.sol  # Test ERC20 token contract
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/      # Web3 and contract interaction services
│   │   └── abi/           # Contract ABIs
├── scripts/                # Deployment and interaction scripts
└── hardhat.config.js      # Hardhat configuration
```

## Smart Contract Features

### LendingPlatform.sol
- Loan request creation with customizable terms
- Loan funding mechanism
- Loan repayment with interest
- Reputation tracking system
- Event emission for frontend updates

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MetaMask browser extension

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd p2p-lending-platform
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Development

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. Configure MetaMask for local network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

   Import one of the private keys shown in the Hardhat node console to MetaMask to get test ETH.

3. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

   After deployment, copy the contract address that appears in the console (it will look like `LendingPlatform deployed at: 0x...`).
   Then update the `CONTRACT_ADDRESS` variable in `frontend/src/App.js` with this new address.

4. Start frontend development server:
```bash
cd frontend
npm start
```

### Testing

Run tests with Hardhat:
```bash
npx hardhat test
```

## Usage

1. Connect your MetaMask wallet to the application
2. Create a loan request by specifying:
   - Loan amount (in ETH)
   - Interest amount (in ETH)
   - Duration (in seconds)
3. View available loans in the loan list
4. Fund loans by sending the required ETH
5. Repay loans before the due date to improve reputation

## Frontend Features

- Wallet connection with MetaMask
- Loan request form
- Active loans display
- Real-time updates using blockchain events
- User reputation display
- Responsive design

## Smart Contract Architecture

### Loan Structure
```solidity
struct Loan {
    address borrower;
    address lender;
    uint256 amount;
    uint256 interest;
    uint256 dueDate;
    bool funded;
    bool repaid;
}
```

### Key Functions
- `requestLoan(uint256 amount, uint256 interest, uint256 duration)`
- `fundLoan(uint256 loanId)`
- `repayLoan(uint256 loanId)`
- `getUserLoans(address user)`
- `getReputation(address user)`

## Security Considerations

- All monetary transactions are validated
- Only borrowers can repay their loans
- Exact amount validation for funding and repayment
- Function access controls
- Event emission for important state changes

## License

This project is licensed under the MIT License.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
