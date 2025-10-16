import { ethers } from 'ethers';

/**
 * 初始化 FHEVM 实例（占位）
 */
export async function initFHEVM() {
  console.log('⚠️ FHEVM功能暂未启用（演示模式）');
  return null;
}

/**
 * 加密数字（占位 - 返回模拟数据）
 */
export async function encryptValue(value) {
  console.log('⚠️ 加密功能暂未启用，使用占位数据');
  // 返回占位加密数据
  return {
    data: '0x' + '0'.repeat(64),
    proof: '0x' + '0'.repeat(128),
  };
}

/**
 * 解密数字（占位）
 */
export async function decryptValue(handle, contractAddress, userAddress, signer) {
  console.log('⚠️ 解密功能暂未启用');
  return '0.0';
}

/**
 * 生成访问许可（占位）
 */
export async function generatePermit(contractAddress, signer) {
  console.log('⚠️ 许可功能暂未启用');
  return null;
}
