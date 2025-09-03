#!/bin/bash

# 获取 Vercel 配置信息脚本
set -e

echo "🔍 获取 Vercel 配置信息..."

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
echo "📋 当前登录用户："
vercel whoami

echo ""
echo "🔗 链接项目到 Vercel..."
vercel link

echo ""
echo "📄 项目配置信息："
if [ -f ".vercel/project.json" ]; then
    cat .vercel/project.json
    echo ""
    
    # 提取配置信息
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    
    echo "✅ 配置信息获取成功："
    echo "VERCEL_ORG_ID=$ORG_ID"
    echo "VERCEL_PROJECT_ID=$PROJECT_ID"
    echo ""
    
    echo "📝 请将以下信息添加到 GitHub Secrets："
    echo "VERCEL_ORG_ID = $ORG_ID"
    echo "VERCEL_PROJECT_ID = $PROJECT_ID"
    echo ""
    
    # 创建本地环境变量文件
    if [ ! -f ".env.local" ]; then
        echo "📁 创建 .env.local 文件..."
        cat > .env.local << EOF
# Vercel 配置信息
VERCEL_ORG_ID=$ORG_ID
VERCEL_PROJECT_ID=$PROJECT_ID

# 其他环境变量
VITE_APP_TITLE=MZ Tools
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
EOF
        echo "✅ .env.local 文件已创建"
    else
        echo "ℹ️  .env.local 文件已存在，请手动更新配置"
    fi
    
else
    echo "❌ 未找到项目配置文件，请重新运行 vercel link"
fi

echo ""
echo "🎯 下一步操作："
echo "1. 复制上面的 ORG_ID 和 PROJECT_ID"
echo "2. 访问 GitHub 仓库 Settings > Secrets and variables > Actions"
echo "3. 添加以下 Secrets："
echo "   - VERCEL_TOKEN (从 https://vercel.com/account/tokens 获取)"
echo "   - VERCEL_ORG_ID"
echo "   - VERCEL_PROJECT_ID"
echo "4. 推送代码触发自动部署"