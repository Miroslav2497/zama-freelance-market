# ⚡ 5分钟快速开始

跟随本指南快速启动项目并测试核心功能。

## 📋 前置检查

确保你有：
- ✅ Node.js 18+ 已安装
- ✅ MetaMask钱包已安装
- ✅ Sepolia测试网ETH（至少0.1 ETH）

检查Node版本：
```bash
node --version  # 应该 >= 18.0.0
npm --version
```

获取Sepolia ETH：
- 🔗 https://sepoliafaucet.com
- 🔗 https://faucet.quicknode.com/ethereum/sepolia

---

## 🚀 3步启动

### Step 1: 克隆并安装 (2分钟)

```bash
# 进入项目目录
cd /Users/lionman/Desktop/Lion工具/zama-freelance-market

# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### Step 2: 配置环境 (1分钟)

```bash
# 复制配置文件
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

编辑 `.env`:
```bash
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Step 3: 编译并部署 (2分钟)

```bash
# 编译合约
npx hardhat compile

# 部署到Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

保存输出的合约地址！

---

## 🎮 测试功能

### 启动前端

```bash
cd frontend
npm run dev
```

访问: http://localhost:3000

### 测试流程

#### 1. 连接钱包
- 点击右上角"连接钱包"
- 在MetaMask中确认
- 确保网络为Sepolia

#### 2. 创建任务
- 点击"发布任务"
- 填写表单:
  ```
  标题: 开发一个Web3 dApp
  描述: 需要有Solidity经验
  预算: 0.1 (将被加密!)
  托管: 0.1
  截止: 选择未来日期
  ```
- 点击"发布任务"
- 在MetaMask确认交易
- 等待确认（~15秒）

#### 3. 查看任务
- 返回首页
- 点击"浏览任务"
- 看到你的任务
- 注意预算显示"🔒 预算加密"

✅ **成功！** 你已经创建了一个加密预算的任务！

---

## 🔍 验证加密

### 在浏览器控制台查看

按F12打开控制台，输入：

```javascript
// 获取合约实例
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  'YOUR_CONTRACT_ADDRESS',
  ABI,
  provider
);

// 获取任务
const job = await contract.jobs(0);
console.log('任务信息:', job);
console.log('加密预算:', job.encryptedBudget);
// 应该看到加密的句柄，而不是明文金额
```

---

## 📊 项目结构一览

```
zama-freelance-market/
├── contracts/
│   └── FreelanceMarketplace.sol  ← 主合约
├── scripts/
│   └── deploy.js                  ← 部署脚本
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.js          ← 首页
│   │   │   ├── create-job.js     ← 创建任务
│   │   │   └── browse-jobs.js    ← 浏览任务
│   │   └── lib/
│   │       ├── fhevm.js          ← FHE工具
│   │       └── contract.js       ← 合约交互
│   └── package.json
└── README.md                      ← 完整文档
```

---

## 🛠️ 常用命令

```bash
# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署到本地
npx hardhat node                    # 终端1
npx hardhat run scripts/deploy.js   # 终端2

# 部署到Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 启动前端
cd frontend && npm run dev

# 检查代码
npm run lint
```

---

## ❓ 快速故障排除

### 问题: 合约编译失败
```bash
# 清理缓存重新编译
npx hardhat clean
npx hardhat compile
```

### 问题: 前端无法连接
- ✅ 检查MetaMask是否在Sepolia网络
- ✅ 检查`.env.local`中的合约地址
- ✅ 刷新页面重新连接钱包

### 问题: 交易失败
- ✅ 确保钱包有足够的Sepolia ETH
- ✅ 检查Gas费设置
- ✅ 查看浏览器控制台错误信息

### 问题: 看不到任务
- ✅ 等待交易确认（15-30秒）
- ✅ 刷新页面
- ✅ 检查合约地址配置

---

## 🎯 下一步

### 完成基础测试后

1. **添加更多功能**
   - 实现提案提交页面
   - 添加任务详情页
   - 实现评价系统

2. **优化体验**
   - 添加加载动画
   - 优化错误提示
   - 移动端适配

3. **准备提交**
   - 录制演示视频
   - 更新README
   - 推送到GitHub

---

## 📚 深入学习

想深入了解？查看：

- 📖 [完整文档](./README.md)
- 🏗️ [架构设计](./ARCHITECTURE.md)
- 🚀 [部署指南](./DEPLOYMENT_GUIDE.md)
- 📝 [提交指南](./SUBMISSION_GUIDE.md)

---

## 💬 需要帮助？

- 📧 提Issue: [GitHub Issues](#)
- 💬 Discord: [Zama Discord](https://discord.gg/zama)
- 📖 文档: [Zama Docs](https://docs.zama.ai)

---

**现在你已经掌握了基础！** 🎉

试试创建几个任务，体验加密预算的魔力吧！

