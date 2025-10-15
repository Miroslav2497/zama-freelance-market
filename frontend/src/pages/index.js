import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Lock, Shield, Zap } from 'lucide-react';

export default function Home({ account, provider, connectWallet }) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalFreelancers: 0,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          隐私保护的自由职业者市场
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          使用 Zama FHEVM 技术，让预算和报价完全保密 🔐
        </p>
        
        {!account ? (
          <button onClick={connectWallet} className="btn btn-primary text-lg px-8 py-3">
            开始使用
          </button>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link href="/create-job" className="btn btn-primary text-lg px-8 py-3">
              发布任务
            </Link>
            <Link href="/browse-jobs" className="btn btn-secondary text-lg px-8 py-3">
              浏览任务
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">加密预算</h3>
          <p className="text-gray-600">
            雇主的预算使用FHE完全加密，只有相关方可以查看
          </p>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">私密报价</h3>
          <p className="text-gray-600">
            自由职业者的报价完全保密，防止价格战和抄袭
          </p>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">智能托管</h3>
          <p className="text-gray-600">
            资金智能托管，任务完成后自动释放，安全可靠
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">如何运作</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h4 className="font-bold mb-2">发布任务</h4>
            <p className="text-sm text-gray-600">
              雇主发布任务并加密预算，锁定托管资金
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h4 className="font-bold mb-2">提交报价</h4>
            <p className="text-sm text-gray-600">
              自由职业者浏览任务并提交加密报价
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h4 className="font-bold mb-2">接受提案</h4>
            <p className="text-sm text-gray-600">
              雇主查看提案并选择合适的自由职业者
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h4 className="font-bold mb-2">完成支付</h4>
            <p className="text-sm text-gray-600">
              任务完成后，托管资金自动释放给自由职业者
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          准备好体验隐私保护的自由职业市场了吗？
        </h2>
        <p className="text-lg mb-8 opacity-90">
          加入我们，享受完全保密的预算和报价体验
        </p>
        {!account ? (
          <button onClick={connectWallet} className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
            立即开始
          </button>
        ) : (
          <Link href="/create-job" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
            发布第一个任务
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-600">
        <p className="text-sm">
          Powered by <span className="font-bold text-primary-600">Zama FHEVM</span> | 
          隐私保护 • 去中心化 • 安全可靠
        </p>
      </div>
    </div>
  );
}

