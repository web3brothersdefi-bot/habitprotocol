const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying StakeMatchV2...");

  // Deploy contract
  const StakeMatchV2 = await hre.ethers.getContractFactory("StakeMatchV2");
  const contract = await StakeMatchV2.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ StakeMatchV2 deployed to:", address);
  console.log("");
  console.log("📋 Contract Details:");
  console.log("   Network: Base Sepolia");
  console.log("   USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e");
  console.log("   Fee Wallet: 0x486b50e142037eBEFF08cB120D0F0462834Dd32c");
  console.log("   Stake Amount: 1 USDC");
  console.log("");
  console.log("🔗 Verify on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${address}`);
  console.log("");
  console.log("📝 Update your .env file:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("");
  console.log("🎯 New Features:");
  console.log("   ✅ getIncomingStakes(address) - Get all incoming stakes");
  console.log("   ✅ getOutgoingStakes(address) - Get all outgoing stakes");
  console.log("   ✅ getActiveIncomingStakes(address) - Get only active incoming");
  console.log("   ✅ getActiveOutgoingStakes(address) - Get only active outgoing");
  console.log("   ✅ No more event log queries needed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
