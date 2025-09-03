const { ethers } = require("hardhat");

async function main() {
  // 1. Get accounts from the Hardhat node
  const [owner, addr1, addr2] = await ethers.getSigners();
  console.log("Deployer account:", owner.address);

  // 2. Get the contract factory
  const MockERC20Token = await ethers.getContractFactory("MockERC20Token");

  // 3. Define initial supply
  const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens

  // 4. Deploy the contract
  console.log("Deploying MockERC20Token...");
  const myToken = await MockERC20Token.deploy("My Hardhat Token", "MHT", initialSupply);
  await myToken.waitForDeployment();
  const tokenAddress = await myToken.getAddress();
  console.log("MockERC20Token deployed to address:", tokenAddress);

  console.log("\n--- Balances before Transfer ---");
  const ownerBalanceInitial = await myToken.balanceOf(owner.address);
  console.log("Owner's balance:", ethers.formatUnits(ownerBalanceInitial, 18), "MHT");
  const addr1BalanceInitial = await myToken.balanceOf(addr1.address);
  console.log("Addr1's balance:", ethers.formatUnits(addr1BalanceInitial, 18), "MHT");

  // 6. Transfer some tokens (e.g., 500 tokens to addr1)
  const transferAmount = ethers.parseUnits("500", 18);
  console.log(`\n--- Transferring ${ethers.formatUnits(transferAmount, 18)} MHT from ${owner.address} to ${addr1.address} ---`);
  const tx = await myToken.transfer(addr1.address, transferAmount);
  await tx.wait(); // Wait for the transaction to be mined

  console.log("\n--- Balances after Transfer ---");
  const ownerBalanceFinal = await myToken.balanceOf(owner.address);
  console.log("Owner's new balance:", ethers.formatUnits(ownerBalanceFinal, 18), "MHT");
  const addr1BalanceFinal = await myToken.balanceOf(addr1.address);
  console.log("Addr1's new balance:", ethers.formatUnits(addr1BalanceFinal, 18), "MHT");

  console.log("\nScript finished successfully!");
}

// This ensures the script exits correctly, even if there's an error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });