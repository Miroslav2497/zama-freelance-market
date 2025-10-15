# 🚀 部署指南

## 准备工作

### 1. 获取测试网 ETH
访问以下水龙头获取 Sepolia 测试网 ETH：
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 2. 获取 RPC URL
注册并获取免费的 RPC URL：
- **Alchemy**: https://www.alchemy.com
- **Infura**: https://www.infura.io

## 部署步骤

### Step 1: 克隆并安装

```bash
git clone <你的仓库地址>
cd zama-freelance-market
npm install
cd frontend && npm install && cd ..
```

### Step 2: 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
PRIVATE_KEY=你的钱包私钥（不要包含0x前缀）
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

⚠️ **警告**：
- 不要提交 `.env` 文件到 Git
- 使用测试钱包，不要使用主网钱包
- 私钥需要从 MetaMask 导出

### Step 3: 编译合约

```bash
npx hardhat compile
```

验证编译成功：
```
✅ Compiled 15 Solidity files successfully
```

### Step 4: 部署到 Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

部署成功后会看到：
```
🚀 开始部署 Freelance Marketplace...
📝 部署账户: 0x...
💰 账户余额: 0.5 ETH
⏳ 正在部署合约...
✅ FreelanceMarketplace 部署成功!
📍 合约地址: 0xYOUR_CONTRACT_ADDRESS
💾 部署信息已保存到 deployment-info.json
```

**重要**：保存合约地址！

### Step 5: 验证合约（可选）

```bash
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

### Step 6: 配置前端

在 `frontend/.env.local` 文件中填入：

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
```

### Step 7: 启动前端

```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

### Step 8: 测试功能

#### 8.1 连接钱包
1. 打开应用
2. 点击"连接钱包"
3. 在 MetaMask 中确认连接
4. 确保切换到 Sepolia 测试网

#### 8.2 创建任务
1. 点击"发布任务"
2. 填写任务信息：
   - 标题：测试任务
   - 描述：这是一个测试任务
   - 预算：0.1 ETH（将被加密）
   - 托管金额：0.1 ETH
   - 截止时间：选择未来日期
3. 点击"发布任务"
4. 在 MetaMask 中确认交易
5. 等待交易确认

#### 8.3 查看任务
1. 返回首页
2. 点击"浏览任务"
3. 应该能看到刚创建的任务
4. 注意预算显示为"加密"状态

## 故障排除

### 问题1：合约部署失败
```
Error: insufficient funds for gas
```
**解决方案**：确保你的钱包有足够的 Sepolia ETH（至少 0.1 ETH）

### 问题2：FHEVM 初始化失败
```
Error: Failed to initialize FHEVM
```
**解决方案**：
1. 检查网络连接
2. 确认 GATEWAY_URL 配置正确
3. 等待几秒后重试

### 问题3：交易失败
```
Error: execution reverted
```
**解决方案**：
1. 检查钱包余额
2. 确认截止时间在未来
3. 确认所有必填字段已填写

### 问题4：无法看到任务
**解决方案**：
1. 刷新页面
2. 检查浏览器控制台是否有错误
3. 确认合约地址配置正确
4. 确认网络为 Sepolia

## 生产环境部署

### 部署到 Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_RPC_URL`
4. 部署

### 部署到主网（未来）

⚠️ **警告**：当前版本仅用于测试！

主网部署前需要：
1. ✅ 完整的安全审计
2. ✅ 充分的测试覆盖
3. ✅ Bug 赏金计划
4. ✅ 保险或应急响应机制
5. ✅ 多签治理

## 性能优化

### Gas 优化建议
1. 批量操作
2. 使用事件而非状态存储
3. 优化数据结构

### 前端优化
1. 启用 Next.js 的 ISR
2. 使用 SWR 缓存
3. 懒加载组件

## 安全检查清单

在提交 Builder Track 之前：
- [ ] 合约已部署到 Sepolia
- [ ] 前端可以正常访问
- [ ] 可以创建任务
- [ ] 预算正确加密
- [ ] 可以查看任务列表
- [ ] README 文档完整
- [ ] 已录制演示视频
- [ ] 代码已推送到 GitHub
- [ ] 已在 Etherscan 验证合约

## 提交资料准备

### Builder Track 提交表单需要：

1. **项目名称**
   - Confidential Freelance Marketplace

2. **项目描述**
   - 一键复制 README 中的简介部分

3. **部署地址**
   - Sepolia 合约地址
   - 前端 URL（如果已部署）

4. **GitHub 仓库**
   - 公开的 GitHub 仓库链接

5. **演示视频**
   - 3-5分钟展示核心功能
   - 建议内容：
     * 项目介绍（30秒）
     * 连接钱包（10秒）
     * 创建加密任务（1分钟）
     * 查看任务列表（30秒）
     * 代码走查（1-2分钟）
     * 总结（30秒）

6. **文档链接**
   - README.md
   - 架构图（可选）
   - API 文档（可选）

## 联系支持

遇到问题？
- 📖 查看 [Zama 文档](https://docs.zama.ai)
- 💬 加入 [Zama Discord](https://discord.gg/zama)
- 🐛 提交 [GitHub Issue](你的仓库/issues)

祝部署顺利！🚀

