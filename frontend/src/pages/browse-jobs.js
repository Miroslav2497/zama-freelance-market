import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { getContract } from '@/lib/contract';
import { ArrowLeft, Briefcase, Clock, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const JobStatusBadge = ({ status }) => {
  const statusConfig = {
    0: { label: '招募中', className: 'badge-green' },
    1: { label: '已分配', className: 'badge-blue' },
    2: { label: '已完成', className: 'badge-gray' },
    3: { label: '已取消', className: 'badge-gray' },
  };
  
  const config = statusConfig[status] || statusConfig[0];
  
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

const JobCard = ({ job, onViewDetails }) => {
  const deadlineDate = new Date(Number(job.deadline) * 1000);
  const isExpired = deadlineDate < new Date();
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex-1">
          {job.title}
        </h3>
        <JobStatusBadge status={job.status} />
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">
        {job.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-1" />
            <span>预算加密</span>
          </div>
          
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            <span>{ethers.formatEther(job.lockedAmount)} ETH 托管</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs">
          <Clock className="w-4 h-4 mr-1" />
          <span className={isExpired ? 'text-red-500' : ''}>
            {isExpired ? '已截止' : `${formatDistanceToNow(deadlineDate, { locale: zhCN, addSuffix: true })}`}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          发布者: {job.employer.slice(0, 6)}...{job.employer.slice(-4)}
        </span>
        
        <button
          onClick={() => onViewDetails(job)}
          className="btn btn-primary text-sm"
        >
          查看详情
        </button>
      </div>
    </div>
  );
};

export default function BrowseJobs({ account, provider, signer }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, assigned, completed

  useEffect(() => {
    loadJobs();
  }, [provider]);

  const loadJobs = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const contract = getContract(provider);
      
      // 获取所有任务（简化版本 - 实际应该有更好的索引方式）
      const allJobs = [];
      let jobId = 0;
      
      while (true) {
        try {
          const job = await contract.jobs(jobId);
          if (job.employer === ethers.ZeroAddress) break;
          
          allJobs.push({
            id: jobId,
            employer: job.employer,
            title: job.title,
            description: job.description,
            status: job.status,
            assignedFreelancer: job.assignedFreelancer,
            createdAt: job.createdAt,
            deadline: job.deadline,
            fundsLocked: job.fundsLocked,
            lockedAmount: job.lockedAmount,
          });
          
          jobId++;
        } catch (error) {
          break;
        }
      }
      
      setJobs(allJobs);
    } catch (error) {
      console.error('加载任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'open') return job.status === 0;
    if (filter === 'assigned') return job.status === 1;
    if (filter === 'completed') return job.status === 2;
    return true;
  });

  const handleViewDetails = (job) => {
    // 导航到任务详情页
    window.location.href = `/jobs/${job.id}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回首页
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">浏览任务</h1>
          <p className="text-gray-600">
            发现适合您的项目机会
          </p>
        </div>
        
        <Link href="/create-job" className="btn btn-primary">
          发布任务
        </Link>
      </div>

      {/* 过滤器 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部任务
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'open'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            招募中
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'assigned'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            进行中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            已完成
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">暂无任务</p>
          <Link href="/create-job" className="btn btn-primary">
            发布第一个任务
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

