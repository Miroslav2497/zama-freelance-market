import { ethers } from 'ethers';
import FreelanceMarketplaceABI from './FreelanceMarketplace.json';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');

/**
 * 获取合约实例
 */
export function getContract(signerOrProvider) {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    FreelanceMarketplaceABI,
    signerOrProvider
  );
}

/**
 * 创建任务
 */
export async function createJob(signer, title, description, encryptedBudget, deadline, lockedAmount) {
  const contract = getContract(signer);
  
  const tx = await contract.createJob(
    title,
    description,
    encryptedBudget.data,
    encryptedBudget.proof,
    deadline,
    { value: ethers.parseEther(lockedAmount) }
  );
  
  const receipt = await tx.wait();
  
  // 从事件中提取 jobId
  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === 'JobCreated';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed.args.jobId;
  }
  
  throw new Error('无法获取任务ID');
}

/**
 * 提交提案
 */
export async function submitProposal(signer, jobId, encryptedBid, coverLetter) {
  const contract = getContract(signer);
  
  const tx = await contract.submitProposal(
    jobId,
    encryptedBid.data,
    encryptedBid.proof,
    coverLetter
  );
  
  const receipt = await tx.wait();
  
  const event = receipt.logs.find(log => {
    try {
      return contract.interface.parseLog(log).name === 'ProposalSubmitted';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed.args.proposalId;
  }
  
  throw new Error('无法获取提案ID');
}

/**
 * 接受提案
 */
export async function acceptProposal(signer, proposalId) {
  const contract = getContract(signer);
  const tx = await contract.acceptProposal(proposalId);
  return await tx.wait();
}

/**
 * 完成任务
 */
export async function completeJob(signer, jobId) {
  const contract = getContract(signer);
  const tx = await contract.completeJob(jobId);
  return await tx.wait();
}

/**
 * 取消任务
 */
export async function cancelJob(signer, jobId) {
  const contract = getContract(signer);
  const tx = await contract.cancelJob(jobId);
  return await tx.wait();
}

/**
 * 获取任务详情
 */
export async function getJob(provider, jobId) {
  const contract = getContract(provider);
  return await contract.jobs(jobId);
}

/**
 * 获取提案详情
 */
export async function getProposal(provider, proposalId) {
  const contract = getContract(provider);
  return await contract.proposals(proposalId);
}

/**
 * 获取任务的所有提案
 */
export async function getJobProposals(provider, jobId) {
  const contract = getContract(provider);
  const proposalIds = await contract.getJobProposals(jobId);
  
  const proposals = await Promise.all(
    proposalIds.map(id => contract.proposals(id))
  );
  
  return proposals;
}

/**
 * 获取雇主的所有任务
 */
export async function getEmployerJobs(provider, employerAddress) {
  const contract = getContract(provider);
  const jobIds = await contract.getEmployerJobs(employerAddress);
  
  const jobs = await Promise.all(
    jobIds.map(id => contract.jobs(id))
  );
  
  return jobs;
}

/**
 * 获取自由职业者的所有提案
 */
export async function getFreelancerProposals(provider, freelancerAddress) {
  const contract = getContract(provider);
  const proposalIds = await contract.getFreelancerProposals(freelancerAddress);
  
  const proposals = await Promise.all(
    proposalIds.map(id => contract.proposals(id))
  );
  
  return proposals;
}

