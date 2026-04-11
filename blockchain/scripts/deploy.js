import hre from "hardhat";

async function main() {
  console.log("Locating the LedgerAnchor smart contract...");
  const LedgerAnchor = await hre.ethers.getContractFactory("LedgerAnchor");
  
  console.log("Deploying contract to the Sepolia Blockchain...");
  const ledgerAnchor = await LedgerAnchor.deploy();
  await ledgerAnchor.waitForDeployment();

  const address = await ledgerAnchor.getAddress();
  console.log("\n==============================================");
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("✅ Contract Address:", address);
  console.log("==============================================\n");
  
  console.log("Next Steps:");
  console.log("1. Open backend/src/main/resources/application.properties");
  console.log("2. Set blockchain.contract.address=" + address);
  console.log("3. Restart your Spring Boot backend!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
