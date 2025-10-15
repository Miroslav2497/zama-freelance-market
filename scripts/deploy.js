const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 Freelance Marketplace...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // 部署合约
  const FreelanceMarketplace = await ethers.getContractFactory("FreelanceMarketplace");
  console.log("⏳ 正在部署合约...");
  
  const marketplace = await FreelanceMarketplace.deploy();
  await marketplace.waitForDeployment();
  
  const address = await marketplace.getAddress();
  console.log("✅ FreelanceMarketplace 部署成功!");
  console.log("📍 合约地址:", address);
  
  // 保存合约地址到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: (await ethers.provider.getNetwork()).chainId.toString()
  };
  
  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 部署信息已保存到 deployment-info.json");
  
  // 输出前端需要的配置
  console.log("\n📋 前端配置:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
  console.log("NEXT_PUBLIC_CHAIN_ID=" + deploymentInfo.chainId);
  
  // 如果是测试网，等待区块确认后验证合约
  if (hre.network.name === "sepolia") {
    console.log("\n⏳ 等待区块确认...");
    await marketplace.deploymentTransaction().wait(5);
    
    console.log("\n🔍 可以使用以下命令验证合约:");
    console.log(`npx hardhat verify --network sepolia ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

