# 常清阁 AI 命理系统 - Vercel 部署指南

> **项目版本**: V2.0 完整版
> **创建时间**: 2025-01-26
> **部署平台**: Vercel Serverless
> **AI模型**: Google Gemini (Genkit框架)

---

## 🚀 部署概览

### 当前状态
- ✅ **项目已完成**: V2版本完整实现，包含所有功能优化
- ✅ **Vercel兼容**: 智能缓存系统，Serverless环境适配
- ✅ **代码就绪**: 所有文件已提交到Git仓库
- ✅ **配置完整**: Vercel配置文件和环境变量设置

### 核心功能
1. **🏮 师者评语系统** - 灯笼符号效果，专业命理师点评
2. **📄 双语报告结构** - 文言开示 + 白话解心
3. **🤖 V2 AI系统** - 五部命理典籍，6000-8000字深度分析
4. **⚡ 智能缓存** - 环境自适应，24小时TTL

---

## 🔧 部署前准备

### 1. Google Gemini API密钥
确保已获取有效的Google Gemini API密钥：

```bash
# 获取API密钥
1. 访问: https://makersuite.google.com/app/apikey
2. 创建新的API密钥
3. 复制密钥备用
```

### 2. Vercel账户准备
- 注册/登录 [Vercel](https://vercel.com)
- 连接GitHub仓库
- 配置部署设置

### 3. 环境变量配置
在Vercel中设置环境变量：

```bash
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

---

## 📋 部署步骤

### 步骤1: 连接GitHub仓库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 导入GitHub仓库: `fsmxgemini`
4. 确认项目设置

### 步骤2: 配置环境变量

在项目设置中添加环境变量：

1. 进入项目 "Settings" → "Environment Variables"
2. 添加变量:
   - **Name**: `GOOGLE_API_KEY`
   - **Value**: 你的Gemini API密钥
   - **Environments**: Production, Preview, Development

### 步骤3: 部署配置确认

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

### 步骤4: 开始部署

1. 点击 "Deploy" 按钮
2. 等待构建完成 (约2-3分钟)
3. 获得部署URL

---

## 🎯 部署后验证

### 1. 功能测试清单

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

### 2. 性能监控

在Vercel Dashboard中监控：

- **Functions**: 查看AI生成函数的执行时间
- **Bandwidth**: 监控API调用成本
- **Error Logs**: 检查是否有错误或超时

### 3. 缓存统计

可以通过浏览器控制台查看缓存日志：

```javascript
// 在浏览器控制台中查看缓存命中情况
console.log('缓存统计:', performance.getEntriesByType('navigation'))
```

---

## ⚠️ 常见问题解决

### 问题1: API密钥错误
**症状**: 生成报告时返回401错误
**解决**:
1. 检查环境变量是否正确设置
2. 确认API密钥有效且有配额
3. 在Vercel中重新部署项目

### 问题2: 生成超时
**症状**: 报告生成超过30秒
**解决**:
1. 检查网络连接
2. 确认Gemini API状态正常
3. 考虑增加`maxDuration`配置

### 问题3: UI显示异常
**症状**: 灯笼符号不显示或背景样式错误
**解决**:
1. 检查CSS文件是否正确加载
2. 确认Tailwind CSS构建正常
3. 清除浏览器缓存重新测试

### 问题4: 缓存不工作
**症状**: 每次请求都调用AI
**解决**:
1. 检查环境检测是否正常
2. 确认内存缓存初始化成功
3. 查看控制台日志分析缓存状态

---

## 🔐 安全配置

### API密钥安全
- ✅ 使用Vercel环境变量存储
- ✅ 不在代码中硬编码密钥
- ✅ 限制API密钥权限

### 内容安全
- ✅ 输入验证和清理
- ✅ 错误处理不暴露敏感信息
- ✅ 用户数据不记录到日志

---

## 📊 成本监控

### Vercel成本
- **Hobby计划**: 免费额度
- **Function执行**: 按使用量计费
- **带宽**: 包含100GB/月

### Gemini API成本
- **Token使用**: 每次报告约6000-8000 tokens
- **缓存效果**: 可减少70%重复调用
- **预估成本**: 约$0.01-0.03/次生成

---

## 🎉 部署成功标志

当看到以下情况时，说明部署成功：

1. **✅ 网站正常访问**: Vercel提供的URL可以打开
2. **✅ UI显示完整**: 灯笼符号闪烁，背景样式正确
3. **✅ AI生成正常**: 提交表单后能生成完整报告
4. **✅ 缓存工作**: 重复请求快速响应
5. **✅ 无错误日志**: Vercel Dashboard无严重错误

---

## 📞 技术支持

### 文档参考
- **项目文档**: [CLAUDE.md](src/app/api/claude.md)
- **V2模板**: [src/prompts/fortune-template-v2.md](src/prompts/fortune-template-v2.md)
- **技术架构**: 详见CLAUDE.md文档

### 问题排查
1. 检查[Vercel部署日志](https://vercel.com/docs/concepts/deployments/logs)
2. 查看浏览器控制台错误
3. 参考本部署指南的常见问题部分

---

**部署完成时间**: 2025-01-26
**下次更新**: 根据用户反馈和性能数据优化

🎊 **恭喜！常清阁AI命理系统已成功部署到Vercel！**