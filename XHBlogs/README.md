This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 网站内编辑台

部署后访问 `/studio`，用指定 GitHub 账号登录，即可发布、编辑、删除文章、杂谈和说说。每次保存都会向仓库提交 Markdown，Vercel 会自动部署更新。

在 Vercel Project Settings -> Environment Variables 配置以下服务端变量：

- `ADMIN_GITHUB_CLIENT_ID` / `ADMIN_GITHUB_CLIENT_SECRET`：新建一个**单独的** GitHub OAuth App。其 Authorization callback URL 设置为 `https://rogerlinx.com/api/admin/callback`。
- `ADMIN_GITHUB_USERNAME`：允许进入编辑台的 GitHub 用户名。
- `ADMIN_GITHUB_REPOSITORY`：目标仓库，例如 `crazyhansome2-bit/myblog`。
- `ADMIN_GITHUB_TOKEN`：Fine-grained personal access token，仅授权该仓库，并给 `Contents` 设置 `Read and write`。
- `ADMIN_SESSION_SECRET`：随机的高强度字符串，例如在本机运行 `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` 生成。

上述变量不能使用 `NEXT_PUBLIC_` 前缀，也不要提交到 Git 仓库。
