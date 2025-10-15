// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FreelanceMarketplace
 * @notice 隐私保护的自由职业者市场 - 使用 Zama FHEVM
 * @dev 雇主发布任务（加密预算），自由职业者提交加密报价
 */
contract FreelanceMarketplace is GatewayCaller, Ownable, ReentrancyGuard {
    
    // ============ 数据结构 ============
    
    enum JobStatus { Open, Assigned, Completed, Cancelled }
    enum ProposalStatus { Pending, Accepted, Rejected }
    
    struct Job {
        uint256 id;
        address employer;
        string title;
        string description;
        euint64 encryptedBudget;      // 加密的预算
        JobStatus status;
        address assignedFreelancer;
        uint256 createdAt;
        uint256 deadline;
        bool fundsLocked;
        uint256 lockedAmount;         // 实际锁定的ETH金额（用于托管）
    }
    
    struct Proposal {
        uint256 id;
        uint256 jobId;
        address freelancer;
        euint64 encryptedBid;         // 加密的报价
        string coverLetter;
        ProposalStatus status;
        uint256 submittedAt;
    }
    
    // ============ 状态变量 ============
    
    uint256 private _jobIdCounter;
    uint256 private _proposalIdCounter;
    
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public jobProposals;  // jobId => proposalIds
    mapping(address => uint256[]) public employerJobs;
    mapping(address => uint256[]) public freelancerProposals;
    
    // 平台手续费（基点，例如 250 = 2.5%）
    uint256 public platformFee = 250;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // 用于解密的回调映射
    mapping(uint256 => bool) private _decryptionRequests;
    
    // ============ 事件 ============
    
    event JobCreated(
        uint256 indexed jobId,
        address indexed employer,
        string title,
        uint256 deadline
    );
    
    event ProposalSubmitted(
        uint256 indexed proposalId,
        uint256 indexed jobId,
        address indexed freelancer
    );
    
    event ProposalAccepted(
        uint256 indexed proposalId,
        uint256 indexed jobId,
        address indexed freelancer
    );
    
    event JobCompleted(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 paymentAmount
    );
    
    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount
    );
    
    // ============ 修饰符 ============
    
    modifier onlyEmployer(uint256 jobId) {
        require(jobs[jobId].employer == msg.sender, "Not the employer");
        _;
    }
    
    modifier jobExists(uint256 jobId) {
        require(jobs[jobId].id == jobId, "Job does not exist");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].id == proposalId, "Proposal does not exist");
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ 核心功能 ============
    
    /**
     * @notice 雇主创建任务（预算加密）
     * @param title 任务标题
     * @param description 任务描述
     * @param encryptedBudget 加密的预算金额
     * @param deadline 截止时间戳
     */
    function createJob(
        string calldata title,
        string calldata description,
        einput encryptedBudget,
        bytes calldata inputProof,
        uint256 deadline
    ) external payable returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value > 0, "Must lock some funds");
        
        uint256 jobId = _jobIdCounter++;
        
        // 将加密预算存储到链上
        euint64 budget = TFHE.asEuint64(encryptedBudget, inputProof);
        TFHE.allowThis(budget);
        TFHE.allow(budget, msg.sender);
        
        jobs[jobId] = Job({
            id: jobId,
            employer: msg.sender,
            title: title,
            description: description,
            encryptedBudget: budget,
            status: JobStatus.Open,
            assignedFreelancer: address(0),
            createdAt: block.timestamp,
            deadline: deadline,
            fundsLocked: true,
            lockedAmount: msg.value
        });
        
        employerJobs[msg.sender].push(jobId);
        
        emit JobCreated(jobId, msg.sender, title, deadline);
        
        return jobId;
    }
    
    /**
     * @notice 自由职业者提交加密报价
     * @param jobId 任务ID
     * @param encryptedBid 加密的报价
     * @param coverLetter 求职信
     */
    function submitProposal(
        uint256 jobId,
        einput encryptedBid,
        bytes calldata inputProof,
        string calldata coverLetter
    ) external jobExists(jobId) returns (uint256) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Job is not open");
        require(job.employer != msg.sender, "Employer cannot submit proposal");
        require(block.timestamp < job.deadline, "Job deadline passed");
        
        uint256 proposalId = _proposalIdCounter++;
        
        // 存储加密报价
        euint64 bid = TFHE.asEuint64(encryptedBid, inputProof);
        TFHE.allowThis(bid);
        TFHE.allow(bid, msg.sender);
        TFHE.allow(bid, job.employer);  // 允许雇主查看
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            jobId: jobId,
            freelancer: msg.sender,
            encryptedBid: bid,
            coverLetter: coverLetter,
            status: ProposalStatus.Pending,
            submittedAt: block.timestamp
        });
        
        jobProposals[jobId].push(proposalId);
        freelancerProposals[msg.sender].push(proposalId);
        
        emit ProposalSubmitted(proposalId, jobId, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @notice 雇主接受提案
     * @param proposalId 提案ID
     */
    function acceptProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        Job storage job = jobs[proposal.jobId];
        
        require(job.employer == msg.sender, "Not the employer");
        require(job.status == JobStatus.Open, "Job is not open");
        require(proposal.status == ProposalStatus.Pending, "Proposal not pending");
        
        // 更新状态
        proposal.status = ProposalStatus.Accepted;
        job.status = JobStatus.Assigned;
        job.assignedFreelancer = proposal.freelancer;
        
        // 拒绝其他所有提案
        uint256[] memory otherProposals = jobProposals[proposal.jobId];
        for (uint256 i = 0; i < otherProposals.length; i++) {
            if (otherProposals[i] != proposalId) {
                proposals[otherProposals[i]].status = ProposalStatus.Rejected;
            }
        }
        
        emit ProposalAccepted(proposalId, proposal.jobId, proposal.freelancer);
    }
    
    /**
     * @notice 标记任务完成并支付
     * @param jobId 任务ID
     */
    function completeJob(uint256 jobId) 
        external 
        onlyEmployer(jobId) 
        nonReentrant 
    {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Assigned, "Job not assigned");
        require(job.fundsLocked, "No funds locked");
        
        job.status = JobStatus.Completed;
        
        // 计算手续费
        uint256 platformFeeAmount = (job.lockedAmount * platformFee) / FEE_DENOMINATOR;
        uint256 freelancerPayment = job.lockedAmount - platformFeeAmount;
        
        // 支付给自由职业者
        (bool success, ) = job.assignedFreelancer.call{value: freelancerPayment}("");
        require(success, "Payment failed");
        
        job.fundsLocked = false;
        job.lockedAmount = 0;
        
        emit JobCompleted(jobId, job.assignedFreelancer, freelancerPayment);
    }
    
    /**
     * @notice 取消任务并退款（仅当未分配时）
     * @param jobId 任务ID
     */
    function cancelJob(uint256 jobId) 
        external 
        onlyEmployer(jobId) 
        nonReentrant 
    {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Job cannot be cancelled");
        require(job.fundsLocked, "No funds to refund");
        
        job.status = JobStatus.Cancelled;
        
        uint256 refundAmount = job.lockedAmount;
        job.lockedAmount = 0;
        job.fundsLocked = false;
        
        (bool success, ) = job.employer.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit FundsWithdrawn(job.employer, refundAmount);
    }
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取任务的所有提案ID
     */
    function getJobProposals(uint256 jobId) external view returns (uint256[] memory) {
        return jobProposals[jobId];
    }
    
    /**
     * @notice 获取雇主发布的所有任务
     */
    function getEmployerJobs(address employer) external view returns (uint256[] memory) {
        return employerJobs[employer];
    }
    
    /**
     * @notice 获取自由职业者的所有提案
     */
    function getFreelancerProposals(address freelancer) external view returns (uint256[] memory) {
        return freelancerProposals[freelancer];
    }
    
    /**
     * @notice 获取加密预算的句柄（用于前端解密）
     */
    function getEncryptedBudget(uint256 jobId) external view jobExists(jobId) returns (euint64) {
        return jobs[jobId].encryptedBudget;
    }
    
    /**
     * @notice 获取加密报价的句柄
     */
    function getEncryptedBid(uint256 proposalId) external view proposalExists(proposalId) returns (euint64) {
        return proposals[proposalId].encryptedBid;
    }
    
    // ============ 管理员函数 ============
    
    /**
     * @notice 更新平台手续费
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // 最高10%
        platformFee = newFee;
    }
    
    /**
     * @notice 提取平台手续费
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }
    
    // ============ 接收ETH ============
    
    receive() external payable {}
}

