const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceMarketplace", function () {
  let marketplace;
  let owner, employer, freelancer;
  
  beforeEach(async function () {
    [owner, employer, freelancer] = await ethers.getSigners();
    
    const FreelanceMarketplace = await ethers.getContractFactory("FreelanceMarketplace");
    marketplace = await FreelanceMarketplace.deploy();
    await marketplace.waitForDeployment();
  });
  
  describe("部署", function () {
    it("应该正确设置所有者", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });
    
    it("应该设置默认平台手续费为2.5%", async function () {
      expect(await marketplace.platformFee()).to.equal(250);
    });
  });
  
  describe("创建任务", function () {
    it("应该允许创建任务并锁定资金", async function () {
      const title = "开发一个Web3 dApp";
      const description = "需要有Solidity和React经验";
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24小时后
      const lockedAmount = ethers.parseEther("1.0");
      
      // 注意：在实际测试中需要模拟FHEVM的加密功能
      // 这里简化处理
      const tx = await marketplace.connect(employer).createJob(
        title,
        description,
        "0x", // 模拟加密预算
        "0x", // 模拟proof
        deadline,
        { value: lockedAmount }
      );
      
      await expect(tx).to.emit(marketplace, "JobCreated");
      
      const job = await marketplace.jobs(0);
      expect(job.employer).to.equal(employer.address);
      expect(job.title).to.equal(title);
      expect(job.lockedAmount).to.equal(lockedAmount);
    });
  });
  
  describe("平台管理", function () {
    it("应该允许所有者更新手续费", async function () {
      await marketplace.setPlatformFee(500); // 5%
      expect(await marketplace.platformFee()).to.equal(500);
    });
    
    it("不应该允许设置过高的手续费", async function () {
      await expect(
        marketplace.setPlatformFee(1001)
      ).to.be.revertedWith("Fee too high");
    });
  });
});

