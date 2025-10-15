# 🔒 Confidential Freelance Marketplace

一个基于 Zama FHEVM 的隐私保护自由职业者市场平台，使用全同态加密（FHE）技术确保预算和报价的完全保密。

## 📖 项目简介

传统的自由职业者平台（如 Upwork、Fiverr）存在严重的隐私问题：
- ❌ 雇主的预算公开可见
- ❌ 自由职业者的报价互相可见，导致价格战
- ❌ 财务信息可能被竞争对手分析

**Confidential Freelance Marketplace** 通过 Zama FHEVM 技术解决这些问题：
- ✅ **加密预算**：雇主的预算使用FHE完全加密
- ✅ **私密报价**：自由职业者的报价完全保密
- ✅ **智能托管**：资金托管在智能合约中，任务完成后自动释放
- ✅ **公平透明**：只有相关方可以解密查看金额

## 🌟 核心特性

### 1. 完全隐私保护
- 使用 Zama FHEVM 对预算和报价进行端到端加密
- 加密数据可以在链上进行计算和比较
- 只有授权方可以解密查看具体金额

### 2. 智能托管系统
- 雇主在发布任务时锁定资金
- 任务完成后自动释放给自由职业者
- 平台收取 2.5% 的手续费

### 3. 用户友好界面
- 现代化的 Web3 前端
- 一键连接 MetaMask
- 直观的任务发布和浏览体验

## 🏗️ 技术架构

### 智能合约层
- **Solidity 0.8.24**：合约开发
- **Zama FHEVM**：全同态加密
- **OpenZeppelin**：安全标准库
- **Hardhat**：开发和测试框架

### 前端层
- **Next.js 14**：React 框架
- **Ethers.js v6**：区块链交互
- **fhevmjs**：FHE 客户端库
- **TailwindCSS**：UI 样式

### 核心加密流程
```
1. 用户输入金额 → 2. 客户端FHE加密 → 3. 上链存储密文
   ↓
4. 合约处理加密数据 → 5. 授权方请求解密 → 6. 客户端显示明文
```

## 🚀 快速开始

### 前置要求
- Node.js >= 18
- MetaMask 钱包
- Sepolia 测试网 ETH

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/your-username/zama-freelance-market.git
cd zama-freelance-market
```

#### 2. 安装依赖
```bash
# 安装合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

#### 3. 配置环境变量
```bash
# 根目录
cp .env.example .env
# 编辑 .env 并填入您的私钥和RPC URL

# 前端目录
cd frontend
cp .env.local.example .env.local
# 编辑 .env.local
cd ..
```

#### 4. 编译合约
```bash
npx hardhat compile
```

#### 5. 部署合约到 Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

部署成功后，将合约地址填入 `frontend/.env.local`：
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x你的合约地址
```

#### 6. 启动前端
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## 📝 使用指南

### 雇主发布任务
1. 连接 MetaMask 钱包
2. 点击"发布任务"
3. 填写任务信息：
   - 标题和描述
   - **预算金额**（将被加密）
   - 托管金额
   - 截止时间
4. 确认交易，预算将被加密上链

### 自由职业者提交报价
1. 浏览任务列表
2. 查看感兴趣的任务
3. 提交加密报价（报价保密）
4. 等待雇主选择

### 雇主接受提案
1. 查看任务的所有提案
2. 可以解密查看自由职业者的报价
3. 选择合适的提案并接受
4. 任务状态更新为"进行中"

### 完成任务
1. 雇主确认任务完成
2. 智能合约自动释放托管资金
3. 扣除 2.5% 平台费后支付给自由职业者

## 🔐 隐私保护机制

### 加密流程
```solidity
// 1. 客户端加密
const encrypted = await encryptValue(budgetAmount);

// 2. 链上存储
euint64 encryptedBudget = TFHE.asEuint64(input, proof);

// 3. 授权访问
TFHE.allow(encryptedBudget, employerAddress);
TFHE.allow(encryptedBudget, acceptedFreelancerAddress);

// 4. 客户端解密（需要授权）
const decrypted = await decryptValue(handle, contract, user, signer);
```

### 访问控制
- ✅ 雇主可以查看自己的预算
- ✅ 被接受的自由职业者可以查看预算
- ❌ 其他人无法查看加密金额
- ✅ 自由职业者只能查看自己的报价
- ✅ 雇主可以查看所有提案的报价

## 📦 项目结构

```
zama-freelance-market/
├── contracts/
│   └── FreelanceMarketplace.sol    # 主合约
├── scripts/
│   └── deploy.js                    # 部署脚本
├── test/
│   └── FreelanceMarketplace.test.js # 测试文件
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.js            # 首页
│   │   │   ├── create-job.js       # 创建任务
│   │   │   └── browse-jobs.js      # 浏览任务
│   │   ├── lib/
│   │   │   ├── fhevm.js            # FHE 工具
│   │   │   └── contract.js         # 合约交互
│   │   └── styles/
│   │       └── globals.css         # 全局样式
│   └── package.json
├── hardhat.config.js
└── package.json
```

## 🧪 测试

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试
npx hardhat test test/FreelanceMarketplace.test.js

# 查看 gas 报告
REPORT_GAS=true npx hardhat test
```

## 🌐 部署信息

### Sepolia 测试网
- **合约地址**: `待部署`
- **区块浏览器**: https://sepolia.etherscan.io
- **水龙头**: https://sepoliafaucet.com

## 🛣️ 路线图

### Phase 1 ✅（当前阶段）
- [x] 基础合约开发
- [x] FHE 加密集成
- [x] 前端界面
- [x] 任务发布和浏览

### Phase 2（计划中）
- [ ] 任务详情页面
- [ ] 提案提交功能
- [ ] 评价系统
- [ ] 争议解决机制

### Phase 3（未来）
- [ ] 多代币支付支持
- [ ] 里程碑分期付款
- [ ] 技能认证系统
- [ ] 移动端适配

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

## 🙏 致谢

- [Zama](https://www.zama.ai/) - FHEVM 技术
- [OpenZeppelin](https://openzeppelin.com/) - 智能合约标准库
- [Hardhat](https://hardhat.org/) - 开发工具

## 📞 联系方式

- GitHub: [@your-username](https://github.com/your-username)
- Twitter: [@your-handle](https://twitter.com/your-handle)
- Discord: [Zama Discord](https://discord.com/invite/zama)

---

**Built with ❤️ using Zama FHEVM**

让自由职业市场更加公平、透明、私密！

