# Vercel 环境变量设置指南

## 🔧 需要设置的环境变量

在Vercel项目设置中添加以下环境变量：

### Google Gemini API密钥
- **变量名**: `GOOGLE_API_KEY`
- **变量值**: `你的实际API密钥`
- **环境**: Production, Preview, Development

## 📋 设置步骤

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Settings" 选项卡
4. 选择 "Environment Variables"
5. 添加新变量：
   ```
   Name: GOOGLE_API_KEY
   Value: 你的实际API密钥
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
6. 点击 "Save" 保存
7. 重新部署项目

## ⚠️ 重要提示

- **绝不在代码中硬编码API密钥**
- **绝不在文档中暴露真实API密钥**
- 确保API密钥有足够的配额
- 设置完成后需要重新部署项目才能生效

## 🚀 部署完成后验证

部署成功后，你可以：
1. 访问网站确认页面正常加载
2. 提交表单测试AI报告生成功能
3. 检查控制台确认缓存系统工作正常

## 🔐 安全提醒

- 定期轮换API密钥
- 监控API使用情况
- 设置合理的配额限制
