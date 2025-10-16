/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // 完全跳过服务端构建时的fhevmjs
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('fhevmjs');
    }
    
    // 客户端WASM支持
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
      
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'webassembly/async',
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;
