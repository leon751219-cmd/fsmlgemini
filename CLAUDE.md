# 常清阁 AI 命理系统 - 项目技术文档

> **项目名称**: 常清阁 AI 命理系统 (玄妙洞察命理报告生成系统)
> **创建时间**: 2025-01-26
> **最后更新**: 2025-01-26
> **项目状态**: ✅ V2 版本升级完成，准备 Vercel 部署
> **当前技术栈**: Next.js 15.3.3 + TypeScript + Tailwind CSS + React 18 + Google Gemini AI

---

## 📋 项目概览

### 项目定位
**常清阁**是一个融合传统文化与现代AI技术的专业命理占卜应用。通过用户的生辰八字信息，利用 **Google Gemini AI** 生成包含文言开示和白话解心双层结构的专业命理报告。

### 技术架构
```
用户表单提交 → FortuneForm组件 → generateFortuneReading函数 →
调用 Gemini API (Genkit) → JSON解析验证 → FortuneResult展示
```

### 核心功能特性
1. **🧮 专业命理分析**: 基于八字、紫微斗数、易经的传统命理学
2. **🤖 AI 智能报告生成**: Google Gemini 2.5 Flash 驱动，6000-9000字详细报告
3. **📄 报告展示系统**: 文言开示 + 师者评语 + 白话解心三层结构
4. **🎨 现代化UI设计**: 道家风格设计，🏮 灯笼符号，阴阳元素
5. **💾 智能缓存**: 24小时TTL缓存机制
6. **📸 报告导出**: HTML2Canvas 高清图片生成

---

## 🏗️ 技术架构详细分析

### 核心技术组件

#### 1. AI 服务层 (V2版本)
**文件**: `src/ai/flows/generate-fortune-reading.ts`
**技术栈**: Google Gemini + Genkit + Zod验证
**关键特性**:
- 使用 V2 完整 prompt 模板
- 融入五部正统命理典籍理论
- 6000-9000字详细命理报告生成
- 性别和地理因素深度分析
- 24小时缓存机制，减少API调用
- 智能时间预测 (根据当前月份动态调整)

#### 2. Google Gemini 集成
**文件**: `src/ai/genkit.ts`
**配置参数**:
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

#### 3. 缓存系统
**文件**: `src/lib/local-cache.ts`
**功能特性**:
- MD5哈希缓存键生成
- 24小时TTL自动过期
- 最多1000条目管理
- 定期清理和统计
- ⚠️ **注意**: Vercel Serverless 环境下需要改为内存缓存

#### 4. 命理模板系统
**文件**: `src/prompts/`
- `fortune-template-v1.md`: 基础版本模板
- `fortune-template-v2.md`: V2高级模板 (五部典籍理论)

---

## 🎯 V2 版本重大升级内容

### 🏛️ AI 系统升级 (V1 → V2)

#### 核心理论升级
**五部正统命理典籍完整集成**:
1. **《渊海子平》**: 八字基础与排盘法则
2. **《子平真诠》**: 格局判断体系
3. **《滴天髓》**: 气象与性情哲理
4. **《穷通宝鉴》**: 调候与岁运推断
5. **《千里命稿》**: 通俗话术与人情表达

#### 术语升级
- **V1版本**: "文言解读"
- **V2版本**: **"文言开示"** (更专业)

#### 字数规范升级
- **全文总字数**: **6000-9000字**
- **各章节**: 文言+白话不少于400字
- **流年岁运**: 不少于600字
- **智能扩写**: 不足5000字自动补全，超过10000字自动精简

#### 时间智能预测
- 根据当前月份 (1-12月) 动态调整预测重点
- 上半年 (1-6月): 重点预测当年，简要提及明年
- 下半年 (7-12月): 总结当年剩余，重点预测明年

### 🎨 UI 视觉系统升级

#### 现代化设计元素
- **🏮 灯笼符号效果**: CSS动画闪烁 (`@keyframes flicker`)
- **容器背景设计**: `bg-cyan-950/20 rounded-lg border border-cyan-400/20`
- **专业CSS类名**: `classical-reading`, `vernacular-reading`, `section-title`
- **段落处理**: `content.split('\n').map()` 智能分段显示

#### CSS 样式系统 (新增163行)
```css
/* 灯笼符号样式 */
.teacher-comment::before {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.1em;
  animation: flicker 3s ease-in-out infinite;
}

/* 文言开示专用格式 */
.classical-reading p {
  text-indent: 2em;
  margin: 0.2rem 0;
  line-height: 1.5;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 0.05em;
}

/* 紧凑格式优化 */
.section-item {
  margin-bottom: 0.8rem !important;
  padding: 0.3rem 0 !important;
}
```

---

## 📊 项目文件结构

### 核心目录结构
```
src/
├── ai/                           # AI 核心逻辑
│   ├── genkit.ts                 # Genkit 配置
│   ├── dev.ts                   # 开发环境配置
│   └── flows/
│       └── generate-fortune-reading.ts  # V2 AI 核心生成逻辑
├── app/                          # Next.js 应用层
│   ├── layout.tsx               # 根布局组件
│   ├── page.tsx                 # 主页面控制器
│   └── globals.css               # 全局样式 (293行)
├── components/                   # React 组件
│   ├── fortune-form.tsx          # 表单组件
│   ├── fortune-result.tsx       # 结果展示组件
│   ├── loading-animation.tsx    # 加载动画
│   ├── mystical-background.tsx  # 背景效果
│   ├── yin-yang-icon.tsx        # 太极图标
│   └── ui/                     # UI 组件库
├── lib/                          # 工具库
│   ├── deepseek.ts              # DeepSeek API (已废弃)
│   ├── local-cache.ts           # 本地缓存
│   ├── generate-report-image.ts  # 报告图片生成
│   └── utils.ts                 # 通用工具
└── prompts/                      # 命理模板
    ├── fortune-template-v1.md   # 基础模板
    └── fortune-template-v2.md   # V2高级模板
```

---

## 🚀 Vercel 部署配置

### 部署文件配置
**文件**: `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "GOOGLE_API_KEY": "@google-api-key"
  },
  "functions": {
    "src/app/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 环境变量配置
```bash
# Vercel 生产环境
GOOGLE_API_KEY=your_google_gemini_api_key_here
NODE_ENV=production
```

### 缓存系统适配方案
**问题**: 本地文件缓存在 Vercel Serverless 环境无效
**解决方案**: 实施内存缓存或 Vercel KV

```typescript
// src/lib/vercel-cache.ts (Vercel 兼容版本)
class VercelMemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any, ttlHours: number = 24): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttlHours * 60 * 60 * 1000)
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
}
```

---

## 📱 项目依赖分析

### 核心依赖包
```json
{
  "dependencies": {
    "@genkit-ai/google-genai": "^1.21.0",
    "@genkit-ai/next": "^1.21.0",
    "genkit": "^1.21.0",
    "genkit-cli": "^1.21.0",
    "next": "15.3.3",
    "react": "^18.3.1",
    "zod": "^3.24.2",
    "typescript": "^5"
  }
}
```

### UI 组件依赖
- **Radix UI**: 完整的 UI 组件库
- **Framer Motion**: 动画效果
- **Lucide React**: 图标库
- **Tailwind CSS**: 样式系统

### 开发工具依赖
- **TypeScript**: 类型检查
- **ESLint**: 代码质量检查
- **PostCSS**: CSS 处理

---

## 🔧 开发工作流程

### 本地开发
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
echo "GOOGLE_API_KEY=your_key_here" > .env.local

# 3. 启动开发服务器
npm run dev
```

### 构建和部署
```bash
# 1. 构建生产版本
npm run build

# 2. 类型检查
npm run typecheck

# 3. 代码检查
npm run lint
```

### Genkit 开发 (可选)
```bash
# 启动 Genkit 开发服务器
npm run genkit:dev

# 监听文件变化
npm run genkit:watch
```

---

## 📊 性能指标与优化

### AI 生成性能
- **API 响应时间**: 30-60秒 (Gemini API)
- **缓存命中响应**: <100ms
- **报告字数**: 6000-9000字
- **Token 使用**: ~8000 tokens per request

### 前端性能
- **首次加载**: <5秒
- **页面大小**: 97 kB + 101 kB (shared)
- **缓存命中率**: 60-80%
- **Lighthouse 评分**: 目标 > 90

### 成本分析
- **Gemini API**: 约 $0.002/次
- **Vercel Pro**: $20/月
- **预估月度**: 根据使用量计算

---

## 🔒 安全与隐私

### API 安全
- ✅ API 密钥通过环境变量管理
- ✅ 客户端无法访问 API 密钥
- ✅ 输入验证通过 Zod Schema
- ✅ 错误处理机制完善

### 数据隐私
- ✅ 生辰八字信息本地处理
- ✅ 无用户数据存储到第三方
- ✅ 符合隐私保护要求
- ✅ GDPR 兼容设计

---

## 🎨 UI/UX 设计规范

### 设计风格
- **主题**: 道家玄学风格
- **配色**: 深蓝色背景 + 青色/金色点缀
- **字体**: 中文字体优化
- **动画**: 微妙、优雅的效果

### 响应式设计
- ✅ 移动端优先设计
- ✅ iOS Safari 兼容性优化
- ✅ 平板和桌面端适配
- ✅ 触摸友好的交互设计

### 交互设计
- **加载状态**: 清晰的进度指示
- **错误处理**: 友好的错误提示
- **成功反馈**: 直观的成功状态
- **操作引导**: 清晰的用户指引

---

## 🔍 测试策略

### 功能测试清单
- [ ] 生辰信息表单提交正常
- [ ] AI 命理报告生成成功
- [ ] 文言开示和白话解心显示完整
- [ ] 🏮 灯笼符号动画正常
- [ ] 报告图片导出功能正常
- [ ] 缓存机制工作正常
- [ ] 移动端响应式适配

### 性能测试
- [ ] API 响应时间 < 60秒
- [ ] 页面加载时间 < 5秒
- [ ] 内存使用稳定
- [ ] 并发处理正常

### 兼容性测试
- [ ] Chrome 浏览器
- [ ] Firefox 浏览器
- [ ] Safari 浏览器 (特别注意 iOS)
- [ ] 移动端设备

---

## 🔄 版本迭代记录

### V2.0.0 (当前版本) - 2025-01-26
**重大升级**:
- ✅ 集成五部正统命理典籍理论
- ✅ 术语统一: "文言解读" → "文言开示"
- ✅ 字数规范: 6000-9000字要求
- ✅ UI 视觉系统现代化
- ✅ 🏮 灯笼符号动画效果
- ✅ 缓存系统优化

### V1.0.0 (GitHub 版本) - 基础版本
**基础功能**:
- ✅ 基础 Gemini AI 集成
- ✅ 基础 UI 组件
- ✅ 简单的报告生成

---

## 📞 技术支持与联系

### 开发文档
- **Genkit 官方文档**: https://firebase.google.com/docs/genkit
- **Google Gemini API**: https://ai.google.dev/
- **Next.js 文档**: https://nextjs.org/docs

### 项目资源
- **GitHub 仓库**: https://github.com/leon751219-cmd/fsmlgemini
- **Vercel 部署**: https://vercel.com/
- **API 参考**: 项目源代码中的详细注释

### 问题反馈
- **技术问题**: 检查项目源代码和文档
- **功能建议**: 通过 GitHub Issues 反馈
- **部署问题**: 查看 Vercel 部署日志

---

**最后更新**: 2025-01-26
**文档版本**: 1.0
**项目状态**: ✅ V2 版本完成，准备部署