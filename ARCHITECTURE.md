# 🏗️ 架构设计文档

## 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户界面层                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   首页      │  │ 创建任务    │  │ 浏览任务    │    │
│  │  (Hero)     │  │ (加密预算)  │  │ (任务列表)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│           Next.js 14 + TailwindCSS                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   前端逻辑层                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  fhevm.js           │  contract.js              │   │
│  │  - initFHEVM()      │  - getContract()         │   │
│  │  - encryptValue()   │  - createJob()           │   │
│  │  - decryptValue()   │  - submitProposal()      │   │
│  │  - generatePermit() │  - acceptProposal()      │   │
│  └─────────────────────────────────────────────────┘   │
│           Ethers.js v6 + fhevmjs                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ JSON-RPC / Web3
                     │
┌────────────────────┴────────────────────────────────────┐
│                  区块链层                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │    FreelanceMarketplace.sol (Sepolia)            │  │
│  │                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │ Job Storage │  │  Proposal   │               │  │
│  │  │  - euint64  │  │   Storage   │               │  │
│  │  │  - status   │  │  - euint64  │               │  │
│  │  │  - escrow   │  │  - status   │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  │                                                   │  │
│  │  Functions:                                       │  │
│  │  - createJob() → 加密预算                        │  │
│  │  - submitProposal() → 加密报价                   │  │
│  │  - acceptProposal() → 匹配                       │  │
│  │  - completeJob() → 释放资金                      │  │
│  └──────────────────────────────────────────────────┘  │
│              Zama FHEVM (TFHE Library)                  │
└─────────────────────────────────────────────────────────┘
```

## 数据流图

### 1. 创建任务流程

```
用户输入预算 (1.0 ETH)
       │
       ▼
客户端加密 (fhevm.js)
  encryptValue(1.0 ETH)
       │
       ▼
生成密文 + Proof
  {data: 0x..., proof: 0x...}
       │
       ▼
提交到合约
  createJob(title, desc, encrypted, proof, deadline)
       │
       ▼
合约验证并存储
  euint64 budget = TFHE.asEuint64(encrypted, proof)
  TFHE.allowThis(budget)
  TFHE.allow(budget, employer)
       │
       ▼
发送事件
  emit JobCreated(jobId, employer, title, deadline)
       │
       ▼
前端显示
  "任务创建成功！预算已加密"
```

### 2. 提交报价流程

```
自由职业者输入报价 (0.8 ETH)
       │
       ▼
客户端加密
  encryptValue(0.8 ETH)
       │
       ▼
生成密文 + Proof
       │
       ▼
提交到合约
  submitProposal(jobId, encryptedBid, proof, coverLetter)
       │
       ▼
合约存储并授权
  euint64 bid = TFHE.asEuint64(encryptedBid, proof)
  TFHE.allow(bid, freelancer)     // 自己可见
  TFHE.allow(bid, employer)       // 雇主可见
       │
       ▼
发送事件
  emit ProposalSubmitted(proposalId, jobId, freelancer)
       │
       ▼
前端显示
  "报价已提交！金额保密"
```

### 3. 接受提案流程

```
雇主查看提案列表
       │
       ▼
选择提案ID并解密报价
  generatePermit(contract, signer)
  decryptValue(bidHandle, contract, user, signature)
       │
       ▼
显示明文报价
  "自由职业者A: 0.8 ETH"
       │
       ▼
雇主接受提案
  acceptProposal(proposalId)
       │
       ▼
合约更新状态
  proposal.status = Accepted
  job.status = Assigned
  job.assignedFreelancer = freelancer
       │
       ▼
发送事件
  emit ProposalAccepted(proposalId, jobId, freelancer)
```

## 核心模块设计

### 智能合约模块

#### FreelanceMarketplace.sol

```solidity
// 数据结构
struct Job {
    uint256 id;
    address employer;
    string title;
    string description;
    euint64 encryptedBudget;    // 🔐 加密预算
    JobStatus status;
    address assignedFreelancer;
    uint256 createdAt;
    uint256 deadline;
    bool fundsLocked;
    uint256 lockedAmount;
}

struct Proposal {
    uint256 id;
    uint256 jobId;
    address freelancer;
    euint64 encryptedBid;       // 🔐 加密报价
    string coverLetter;
    ProposalStatus status;
    uint256 submittedAt;
}
```

#### 关键函数

| 函数 | 权限 | 功能 | Gas 估算 |
|------|------|------|----------|
| `createJob()` | 任何人 | 创建任务，加密预算 | ~200k |
| `submitProposal()` | 任何人 | 提交提案，加密报价 | ~150k |
| `acceptProposal()` | 雇主 | 接受提案 | ~100k |
| `completeJob()` | 雇主 | 完成任务，释放资金 | ~80k |
| `cancelJob()` | 雇主 | 取消任务，退款 | ~60k |

### 前端模块

#### fhevm.js - FHE 工具库

```javascript
// 核心函数
initFHEVM()           // 初始化 FHEVM 实例
encryptValue(value)   // 加密数值
decryptValue(handle)  // 解密数值
generatePermit()      // 生成访问许可
```

#### contract.js - 合约交互

```javascript
// 核心函数
getContract(signer)          // 获取合约实例
createJob(...)               // 创建任务
submitProposal(...)          // 提交提案
acceptProposal(proposalId)   // 接受提案
completeJob(jobId)           // 完成任务
getJob(jobId)                // 获取任务详情
```

## 安全设计

### 访问控制矩阵

| 数据 | 雇主 | 自由职业者A | 自由职业者B | 其他人 |
|------|------|------------|------------|--------|
| 任务预算 | ✅ 可解密 | ✅ 可解密（被选中后） | ❌ 不可见 | ❌ 不可见 |
| 报价A | ✅ 可解密 | ✅ 可解密 | ❌ 不可见 | ❌ 不可见 |
| 报价B | ✅ 可解密 | ❌ 不可见 | ✅ 可解密 | ❌ 不可见 |
| 托管金额 | ✅ 公开 | ✅ 公开 | ✅ 公开 | ✅ 公开 |

### 实现方式

```solidity
// 创建任务时设置访问权限
TFHE.allowThis(budget);        // 合约可访问（用于逻辑）
TFHE.allow(budget, employer);  // 雇主可解密

// 提交报价时设置访问权限
TFHE.allow(bid, freelancer);   // 自己可解密
TFHE.allow(bid, employer);     // 雇主可解密
```

## 性能优化

### Gas 优化策略

1. **批量操作**
   - 使用事件而非存储查询历史
   - 只存储必要的链上数据

2. **数据结构优化**
   - 使用映射而非数组
   - 紧凑的结构体打包

3. **计算优化**
   - 缓存重复计算
   - 避免不必要的状态读取

### 前端性能

1. **懒加载**
   - 按需加载组件
   - 虚拟滚动长列表

2. **缓存策略**
   - 使用 SWR 缓存请求
   - 本地存储常用数据

3. **网络优化**
   - 批量RPC请求
   - WebSocket实时更新

## 扩展性设计

### Phase 1（当前）
- ✅ 基础功能
- ✅ FHE 加密
- ✅ 简单托管

### Phase 2（未来）
- 多币种支付
- 里程碑付款
- 评价系统

### Phase 3（远期）
- 争议仲裁
- DAO 治理
- 跨链支持

## 技术栈详情

### 智能合约
- **Solidity**: 0.8.24
- **Zama FHEVM**: 最新版
- **OpenZeppelin**: 5.0.0
- **Hardhat**: 2.19.0

### 前端
- **Next.js**: 14.0.0
- **React**: 18.2.0
- **Ethers.js**: 6.9.0
- **fhevmjs**: 0.5.0
- **TailwindCSS**: 3.3.0

### 开发工具
- **TypeScript**: 5.0.0
- **ESLint**: 8.0.0
- **Prettier**: 3.0.0

## 测试策略

### 单元测试
- 合约功能测试
- 边界条件测试
- 失败场景测试

### 集成测试
- 端到端流程测试
- 前后端集成测试

### 性能测试
- Gas 消耗测试
- 并发压力测试

## 部署架构

```
┌─────────────────────────────────────┐
│         前端部署 (Vercel)           │
│  - Next.js 静态页面                 │
│  - CDN 加速                         │
│  - HTTPS 支持                       │
└───────────┬─────────────────────────┘
            │
            │ JSON-RPC
            │
┌───────────┴─────────────────────────┐
│    Sepolia 测试网                   │
│  - FreelanceMarketplace.sol         │
│  - 在 Etherscan 验证                │
└─────────────────────────────────────┘
```

## 监控和日志

### 合约事件
- `JobCreated` - 任务创建
- `ProposalSubmitted` - 提案提交
- `ProposalAccepted` - 提案接受
- `JobCompleted` - 任务完成
- `FundsWithdrawn` - 资金提取

### 前端日志
- 错误追踪
- 性能监控
- 用户行为分析

---

**架构版本**: v1.0.0  
**最后更新**: 2024年

