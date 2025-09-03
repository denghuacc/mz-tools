#!/bin/bash

# 部署脚本 - Deploy to Vercel
set -e

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

# 运行测试
echo "🧪 运行测试..."
pnpm run test --run

# 构建项目
echo "🔨 构建项目..."
pnpm run build

# 部署到 Vercel
echo "📦 部署到 Vercel..."
if [ "$1" = "prod" ]; then
    echo "🌟 部署到生产环境..."
    vercel --prod
else
    echo "🔍 部署到预览环境..."
    vercel
fi

echo "✅ 部署完成！"