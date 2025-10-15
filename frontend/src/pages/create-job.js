import { useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { encryptValue } from '@/lib/fhevm';
import { createJob } from '@/lib/contract';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateJob({ account, signer, connectWallet }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    lockedAmount: '',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      alert('请先连接钱包');
      connectWallet();
      return;
    }

    if (!formData.title || !formData.description || !formData.budget || !formData.lockedAmount) {
      alert('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);

      // 1. 加密预算
      console.log('🔐 正在加密预算...');
      const budgetWei = ethers.parseEther(formData.budget);
      const encryptedBudget = await encryptValue(budgetWei);

      // 2. 准备截止时间
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

      // 3. 创建任务
      console.log('📝 正在创建任务...');
      const jobId = await createJob(
        signer,
        formData.title,
        formData.description,
        encryptedBudget,
        deadlineTimestamp,
        formData.lockedAmount
      );

      console.log('✅ 任务创建成功! ID:', jobId.toString());
      alert('任务创建成功！');
      
      router.push('/browse-jobs');
    } catch (error) {
      console.error('❌ 创建任务失败:', error);
      alert('创建任务失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 获取7天后的日期作为默认截止时间
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">请先连接钱包</h2>
        <button onClick={connectWallet} className="btn btn-primary">
          连接钱包
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">发布新任务</h1>
        <p className="text-gray-600 mb-8">
          您的预算将使用 FHE 加密，只有您和被接受的自由职业者可以查看
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任务标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="例如：开发一个 Web3 dApp"
              className="input"
              required
            />
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="详细描述您的需求、技能要求、交付物等..."
              rows={6}
              className="input"
              required
            />
          </div>

          {/* 预算（加密） */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算金额 (ETH) <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-yellow-600">🔒 此信息将被加密</span>
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="0.5"
              step="0.001"
              min="0"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              这是您愿意支付的金额，将以加密形式存储在链上
            </p>
          </div>

          {/* 托管金额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              托管金额 (ETH) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="lockedAmount"
              value={formData.lockedAmount}
              onChange={handleChange}
              placeholder="1.0"
              step="0.001"
              min="0"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              此金额将被锁定在智能合约中，任务完成后释放给自由职业者（扣除2.5%平台费）
            </p>
          </div>

          {/* 截止时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              截止时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="input"
              required
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                '发布任务'
              )}
            </button>
            
            <Link href="/" className="btn btn-secondary">
              取消
            </Link>
          </div>
        </form>

        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">💡 提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 您的预算金额将使用 Zama FHEVM 完全加密</li>
            <li>• 只有您和被选中的自由职业者可以查看加密的预算</li>
            <li>• 托管金额将被锁定，确保任务完成后的支付</li>
            <li>• 平台收取 2.5% 的手续费</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

