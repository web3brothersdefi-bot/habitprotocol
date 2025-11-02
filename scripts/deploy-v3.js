const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying StakeMatchV3 - Fully On-Chain...");

  const StakeMatchV3 = await hre.ethers.getContractFactory("StakeMatchV3");
  const contract = await StakeMatchV3.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ StakeMatchV3 deployed to:", address);
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
  console.log("🎯 V3 Features:");
  console.log("   ✅ Users stored on-chain");
  console.log("   ✅ Images on IPFS");
  console.log("   ✅ getAllUsersWithProfiles() - Get all users + profiles");
  console.log("   ✅ getUsersByRole(role) - Filter by role");
  console.log("   ✅ getActiveIncomingStakes() - With full profiles");
  console.log("   ✅ getActiveOutgoingStakes() - With full profiles");
  console.log("   ✅ Only chat on Supabase");
  console.log("   ✅ Fully decentralized!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
