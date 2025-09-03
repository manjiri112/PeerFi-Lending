const hre = require("hardhat");

async function main() {
    const LendingPlatform = await hre.ethers.deployContract("LendingPlatform");
    await LendingPlatform.waitForDeployment();
    console.log("LendingPlatform deployed at:", LendingPlatform.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
