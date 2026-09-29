#!/bin/bash

# 将本地目录关联到现有 Vercel 项目，供手动部署使用。
set -e

if ! command -v vercel > /dev/null 2>&1; then
    echo "请先安装 Vercel CLI，再运行 pnpm vercel:config。"
    exit 1
fi

if ! vercel whoami > /dev/null 2>&1; then
    vercel login
fi

vercel link

echo "本地项目关联完成。自动部署请在 Vercel Dashboard 中配置 Git 仓库。"
