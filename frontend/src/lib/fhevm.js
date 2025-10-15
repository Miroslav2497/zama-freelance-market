import { createInstance } from 'fhevmjs';
import { ethers } from 'ethers';

let fhevmInstance = null;

/**
 * 初始化 FHEVM 实例
 */
export async function initFHEVM() {
  if (fhevmInstance) return fhevmInstance;
  
  try {
    // 从Zama网关获取公钥
    const publicKey = await fetch(
      process.env.NEXT_PUBLIC_GATEWAY_URL + '/fhe-public-key'
    ).then(res => res.json());
    
    fhevmInstance = await createInstance({
      kmsContractAddress: process.env.NEXT_PUBLIC_KMS_CONTRACT_ADDRESS || '0x...',
      aclContractAddress: process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDRESS || '0x...',
      publicKey: publicKey,
    });
    
    console.log('✅ FHEVM 实例初始化成功');
    return fhevmInstance;
  } catch (error) {
    console.error('❌ FHEVM 初始化失败:', error);
    throw error;
  }
}

/**
 * 加密数字（用于预算和报价）
 */
export async function encryptValue(value) {
  const instance = await initFHEVM();
  
  try {
    // 将值转换为 uint64
    const valueUint64 = ethers.toBigInt(value);
    
    // 加密
    const encrypted = instance.encrypt64(valueUint64);
    
    return {
      data: encrypted.data,
      proof: encrypted.proof,
    };
  } catch (error) {
    console.error('❌ 加密失败:', error);
    throw error;
  }
}

/**
 * 解密数字
 */
export async function decryptValue(handle, contractAddress, userAddress, signer) {
  const instance = await initFHEVM();
  
  try {
    // 生成解密许可签名
    const { publicKey, signature } = await instance.generatePermit(
      contractAddress,
      signer
    );
    
    // 请求解密
    const decrypted = await instance.decrypt(
      handle,
      contractAddress,
      userAddress,
      signature
    );
    
    return ethers.formatEther(decrypted);
  } catch (error) {
    console.error('❌ 解密失败:', error);
    throw error;
  }
}

/**
 * 生成访问许可（允许查看加密数据）
 */
export async function generatePermit(contractAddress, signer) {
  const instance = await initFHEVM();
  
  try {
    return await instance.generatePermit(contractAddress, signer);
  } catch (error) {
    console.error('❌ 生成许可失败:', error);
    throw error;
  }
}

