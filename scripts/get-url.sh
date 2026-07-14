#!/bin/bash

# 获取部署网址脚本
set -e

echo "🔍 获取 MZ Tools 部署网址..."

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

echo ""
echo "📋 项目信息："

# 获取项目列表和网址
vercel ls --scope $(vercel whoami) | grep mz-tools || {
    echo "❌ 未找到 mz-tools 项目"
    echo "💡 请先运行: pnpm run vercel:config"
    exit 1
}

echo ""
echo "🌐 获取详细网址信息..."

# 获取项目详情
PROJECT_INFO=$(vercel inspect --scope $(vercel whoami) 2>/dev/null || echo "")

if [ -n "$PROJECT_INFO" ]; then
    echo "$PROJECT_INFO" | grep -E "(https://.*\.vercel\.app|Production|Preview)" || true
else
    echo "💡 使用以下命令获取更多信息："
    echo "   vercel ls"
    echo "   vercel inspect"
fi

echo ""
echo "🎯 常用网址格式："
echo "   • 生产环境: https://mz-tools.vercel.app"
echo "   • 或者: https://mz-tools-[hash].vercel.app"

echo ""
echo "📱 其他获取方式："
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • GitHub Actions: https://github.com/denghuacc/mz-tools/actions"
