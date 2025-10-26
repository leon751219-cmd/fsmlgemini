# 常清阁 - 玄妙洞察 🌟

> 基于 Next.js 15 和 Google Gemini AI 的中国传统命理占卜应用

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Google Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

## ✨ 项目简介

常清阁是一个融合传统文化与现代AI技术的命理占卜应用。通过用户的生辰八字信息，利用 **Google Gemini AI** 生成专业的命理解读，包含文言解读和白话解心两种风格，并配有专业的师者评语系统。

### 主要特性

- 🎯 **智能命理分析** - 基于 Google Gemini AI，支持长文本生成
- 📜 **双语解读** - 文言古典风格 + 现代白话风格
- 🏮 **师者评语系统** - 专业命理师点评，灯笼符号动画效果
- 📄 **格式优化** - 一段式连续文本，容器背景统一，紧凑布局
- 🎨 **神秘UI设计** - 动态粒子背景、太极图标、渐变配色
- 📱 **响应式设计** - 完美适配移动端和桌面端，iOS Safari 优化
- 💾 **报告导出** - 一键保存为高清图片
- ⚡ **缓存系统** - 本地24小时缓存，极速响应体验
- 📚 **专业命理典籍** - 融入《渊海子平》《子平真诠》《滴天髓》《穷通宝鉴》《千里命稿》理论

## 🚀 快速开始

### 环境要求

- Node.js >= 20.x
- npm >= 9.x
- DeepSeek API Key

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/leon751219-cmd/fsmxbeta.git
cd fsmxbeta
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件：

```env
GOOGLE_API_KEY=你的Google_Gemini_API密钥
```

> 💡 获取 API Key: https://makersuite.google.com/app/apikey

4. **启动开发服务器**

```bash
npm run dev
```

访问 http://localhost:9002

## 📦 技术栈

### 核心框架

- **Next.js 15.3.3** - React 全栈框架，App Router
- **React 18.3.1** - UI 库
- **TypeScript 5.9.3** - 类型安全

### AI 集成

- **DeepSeek Chat API** - AI 模型接口
- **自定义API客户端** - 超时处理、重试机制
- **8000 tokens支持** - 长文本生成能力
- **24小时本地缓存** - 文件系统缓存机制

### UI 框架

- **Tailwind CSS 3.4.1** - 原子化 CSS
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Framer Motion 11.3.19** - 动画库
- **Lucide React** - 图标库

### 表单与验证

- **React Hook Form 7.54.2** - 表单管理
- **Zod 3.24.2** - Schema 验证
- **@hookform/resolvers** - 表单验证集成

### 工具库

- **html2canvas 1.4.1** - HTML 转图片（动态导入）
- **date-fns** - 日期处理
- **class-variance-authority** - 组件变体管理
- **clsx & tailwind-merge** - 样式工具
- **React Hook Form 7.54.2** - 表单管理
- **Zod 3.24.2** - Schema 验证

## 📁 项目结构

```
fsmxbeta/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 主页面
│   │   └── globals.css         # 全局样式（含🏮灯笼动画）
│   ├── ai/                     # AI 集成（优化完成）
│   │   ├── generate-fortune-reading.ts        # 主入口函数
│   │   ├── generate-fortune-reading-first-stage.ts  # 🎯核心AI生成函数
│   │   └── deepseek.ts                    # DeepSeek API客户端
│   ├── components/             # React 组件
│   │   ├── fortune-form.tsx    # 表单组件（React Hook Form）
│   │   ├── fortune-result.tsx  # 结果展示（文言/白话双Tab + 🏮师者评语）
│   │   ├── loading-animation.tsx
│   │   ├── mystical-background.tsx
│   │   ├── yin-yang-icon.tsx
│   │   └── ui/                 # shadcn/ui 组件
│   ├── lib/                    # 工具库
│   │   ├── deepseek.ts         # DeepSeek API接口
│   │   ├── local-cache.ts      # 本地缓存系统
│   │   └── generate-report-image.ts  # 图片生成（动态导入）
│   └── prompts/                # AI Prompt模板
│       └── fortune-template-v2.md    # 完整命理典籍模板
├── public/
│   └── images/                 # 静态资源
├── docs/                       # 项目文档
│   ├── CLAUDE.md               # 技术工作备忘录
│   └── TODO.md                # 任务跟踪
├── .env                        # 环境变量（不提交）
├── components.json             # shadcn/ui 配置
├── next.config.ts              # Next.js 配置
├── package.json
└── README.md
```

## 🎨 设计系统

### 颜色主题

- **主色调**: Sky Blue (`#B0E2FF`) - 天体与空灵
- **背景色**: Dark Blue (`#0A1628`) - 神秘与深邃
- **强调色**: Amber Gold (`#C3B091`) - 高贵典雅

### 字体

- **正文**: Noto Serif SC - 文学复古
- **标题**: Inter - 现代简洁

## 🔧 可用脚本

```bash
# 开发模式（端口 9002）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run typecheck

# Genkit 开发工具
npm run genkit:dev
npm run genkit:watch
```

## 📖 核心功能

### 1. 生辰信息采集

- 出生日期选择（1900年至今）
- 精确时间输入（HH:MM）
- 性别选择（影响大运排法）
- 出生地点（省市信息）

### 2. AI 命理解读

基于 Google Gemini 2.5 Flash 生成：

**文言解读**（7个维度）:
- 八字命盘
- 五行生克
- 心性天赋
- 官禄事业
- 姻缘情感
- 康健关要
- 流年岁运

**白话解心**（现代风格）:
- 📜 八字命盘
- 💫 五行平衡
- 🧠 性格与天赋
- 💼 事业发展
- ❤️ 感情与婚姻
- 🍃 健康与养生
- 🌟 未来一年运势

### 3. 报告导出

- HTML2Canvas 高清渲染（动态导入）
- 自动展开所有折叠内容
- 2倍分辨率输出
- PNG 格式下载
- 完整的文言和白话双版本

## 🌐 部署指南

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leon751219-cmd/fsmlgemini)

#### 快速部署步骤

1. **连接GitHub仓库**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New..." → "Project"
   - 导入GitHub仓库: `fsmlgemini`
   - 确认项目设置

2. **配置环境变量**
   - 进入项目 "Settings" → "Environment Variables"
   - 添加变量:
     - **Name**: `GOOGLE_API_KEY`
     - **Value**: 你的Gemini API密钥
     - **Environments**: Production, Preview, Development

3. **开始部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成 (约2-3分钟)
   - 获得部署URL

#### 环境变量设置

在Vercel项目设置中添加以下环境变量：

**Google Gemini API密钥**:
- **变量名**: `GOOGLE_API_KEY`
- **变量值**: `你的实际API密钥`
- **环境**: Production, Preview, Development

**设置步骤**:
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Settings" 选项卡
4. 选择 "Environment Variables"
5. 添加新变量并保存
6. 重新部署项目

#### 部署配置确认

确认以下配置正确：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/app/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 部署后验证

#### 功能测试清单

**基础功能测试**:
- [ ] 页面正常加载 (< 3秒)
- [ ] 表单提交正常
- [ ] AI报告生成成功
- [ ] UI显示正确（灯笼符号、背景样式）

**缓存系统测试**:
- [ ] 首次生成时间 < 30秒
- [ ] 缓存命中时间 < 100ms
- [ ] 重复请求返回缓存结果

**AI内容质量**:
- [ ] 文言开示格式正确
- [ ] 白话解心通俗易懂
- [ ] 总字数在6000-8000字范围
- [ ] 包含五部典籍理论

#### 性能监控

在Vercel Dashboard中监控：
- **Functions**: 查看AI生成函数的执行时间
- **Bandwidth**: 监控API调用成本
- **Error Logs**: 检查是否有错误或超时

### 常见问题解决

#### 问题1: API密钥错误
**症状**: 生成报告时返回401错误
**解决**:
1. 检查环境变量是否正确设置
2. 确认API密钥有效且有配额
3. 在Vercel中重新部署项目

#### 问题2: 生成超时
**症状**: 报告生成超过30秒
**解决**:
1. 检查网络连接
2. 确认Gemini API状态正常
3. 考虑增加`maxDuration`配置

#### 问题3: UI显示异常
**症状**: 灯笼符号不显示或背景样式错误
**解决**:
1. 检查CSS文件是否正确加载
2. 确认Tailwind CSS构建正常
3. 清除浏览器缓存重新测试

#### 问题4: 缓存不工作
**症状**: 每次请求都调用AI
**解决**:
1. 检查环境检测是否正常
2. 确认内存缓存初始化成功
3. 查看控制台日志分析缓存状态

### 成本监控

#### Vercel成本
- **Hobby计划**: 免费额度
- **Function执行**: 按使用量计费
- **带宽**: 包含100GB/月

#### Gemini API成本
- **Token使用**: 每次报告约6000-8000 tokens
- **缓存效果**: 可减少70%重复调用
- **预估成本**: 约$0.01-0.03/次生成

## 🔧 已解决的关键问题

### 1. Vercel 部署中的 html2canvas 问题

**问题描述**：
- "保存命理书页"功能在 Firebase Studio 正常，但在 Vercel 部署后失效
- 原因：html2canvas 是纯客户端库，在 Vercel 的无服务器环境中构建时遇到 `window/document` 未定义错误

**解决方案**：
```typescript
// src/lib/generate-report-image.ts
export async function generateReportImage(element: HTMLElement) {
  // 动态导入 html2canvas，确保只在客户端加载
  const html2canvas = (await import('html2canvas')).default;
  // ... 其余代码
}
```

**技术要点**：
- 使用动态导入 `await import('html2canvas')` 避免服务器端构建错误
- 在 `fortune-result.tsx` 中也使用动态导入处理
- 确保 html2canvas 永远只在浏览器环境中执行

### 2. iOS Safari 表单控件兼容性问题

**问题描述**：
- iPhone Safari 中"出生日期"输入框比"出生地点"短
- "出生时间"和"性别"两个输入框宽度不一致
- iOS 原生控件样式干扰统一设计

**解决方案**：
```css
/* src/app/globals.css */
/* iOS Safari 表单控件兼容性修复 */
input[type="date"],
input[type="time"],
input[type="text"],
select {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  width: 100% !important;
  height: 3rem !important;
  box-sizing: border-box;
  padding: 0.75rem !important;
}

/* 移除 iOS 自带的日历和时钟图标 */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  display: none;
  pointer-events: none;
}
```

**技术要点**：
- 使用 `!important` 覆盖 iOS 原生样式
- 统一所有表单控件的尺寸和内边距
- 移除 iOS 自带的日历和时钟图标
- 针对 Radix UI 的 SelectTrigger 组件特别优化

### 3. 环境隔离最佳实践

**问题描述**：
- Genkit AI 流程需要在服务器端执行（保护 API 密钥）
- html2canvas 需要在客户端执行（浏览器环境）
- 需要明确的环境边界避免部署问题

**解决方案**：
```typescript
// 服务器端 AI 流程
'use server';
export async function generateFortuneReading(input) {
  // AI 处理逻辑
}

// 客户端组件
'use client';
const { generateReportImage } = await import('@/lib/generate-report-image');
```

## 🔐 安全配置

### API密钥安全
- ✅ 使用Vercel环境变量存储
- ✅ 不在代码中硬编码密钥
- ✅ 限制API密钥权限

### 内容安全
- ✅ 输入验证和清理
- ✅ 错误处理不暴露敏感信息
- ✅ 用户数据不记录到日志

### 重要安全提醒

⚠️ **绝不在代码中硬编码API密钥**
⚠️ **绝不在文档中暴露真实API密钥**
- 定期轮换API密钥
- 监控API使用情况
- 设置合理的配额限制

## 📝 常见问题

### Q: Vercel 部署后"保存命理书页"功能不工作？

**A**: 这是因为 html2canvas 的环境隔离问题。确保使用动态导入：
```typescript
const html2canvas = (await import('html2canvas')).default;
```

### Q: iPhone Safari 上输入框宽度不一致？

**A**: 检查 `globals.css` 中是否包含 iOS Safari 兼容性修复样式。

### Q: Gemini API 调用失败？

**A**:
1. 检查环境变量中的 API Key 是否正确
2. 确保 API Key 未过期且有足够配额
3. 检查网络是否能访问 Google 服务

### Q: 构建时出现 TypeScript 错误？

**A**:
1. 确保所有动态导入正确使用
2. 检查类型定义是否完整
3. 运行 `npm run typecheck` 检查类型错误

## 🚀 性能优化

1. **动态导入**: html2canvas 只在需要时加载，减少初始包大小
2. **图片优化**: Next.js 自动优化静态资源
3. **字体优化**: 预加载关键字体确保渲染质量
4. **代码分割**: AI 流程和图片生成功能分别打包

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Google Gemini](https://ai.google.dev/) - AI 模型
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [html2canvas](https://html2canvas.hertzen.com/) - 截图库

## 📧 联系方式

- **GitHub**: [@leon751219-cmd](https://github.com/leon751219-cmd)
- **Issues**: [项目 Issues](https://github.com/leon751219-cmd/fsmlgemini/issues)

---

**⚡ 天地玄黄，宇宙洪荒 ⚡**

Made with ❤️ by 常清阁团队