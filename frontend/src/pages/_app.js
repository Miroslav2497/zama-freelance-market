import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { initFHEVM } from '@/lib/fhevm';

export default function App({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask!');
      return;
    }

    try {
      setLoading(true);
      
      // 请求账户访问
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      
      // 初始化 FHEVM
      await initFHEVM();
      
      console.log('✅ 钱包连接成功:', address);
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🔒 Confidential Freelance
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? '连接中...' : '连接钱包'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Component 
        {...pageProps} 
        account={account}
        provider={provider}
        signer={signer}
        connectWallet={connectWallet}
      />
    </div>
  );
}

