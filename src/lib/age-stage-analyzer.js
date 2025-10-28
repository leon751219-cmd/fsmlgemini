// 年龄阶段分析工具
class AgeStageAnalyzer {
  constructor() {
    this.stages = {
      youth: { name: '青少年期', min: 0, max: 17, focus: '学业成长' },
      young: { name: '青年期', min: 18, max: 29, focus: '就业创业' },
      prime: { name: '壮年期', min: 30, max: 44, focus: '事业发展' },
      middle: { name: '中年期', min: 45, max: 59, focus: '稳定传承' },
      elder: { name: '老年期', min: 60, max: 150, focus: '养生智慧' }
    };
  }

  /**
   * 根据出生日期计算当前年龄阶段
   * @param {string} birthDate - 出生日期 YYYY-MM-DD
   * @returns {Object} 年龄阶段信息
   */
  calculateAgeStage(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();

    // 计算准确年龄
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // 确定年龄阶段
    let currentStage = null;
    for (const [key, stage] of Object.entries(this.stages)) {
      if (age >= stage.min && age <= stage.max) {
        currentStage = { ...stage, key, age };
        break;
      }
    }

    // 生成年龄段特色建议
    const stageAdvice = this.generateStageAdvice(currentStage);

    return {
      age,
      stage: currentStage,
      advice: stageAdvice,
      nextStage: this.getNextStage(currentStage),
      previousStage: this.getPreviousStage(currentStage)
    };
  }

  /**
   * 生成针对年龄段的命理分析建议
   * @param {Object} stage - 年龄阶段信息
   * @returns {Object} 建议内容
   */
  generateStageAdvice(stage) {
    if (!stage) return {};

    const adviceMap = {
      youth: {
        career: '宜专注学业，培养兴趣，为未来发展打下基础',
        relationship: '以学业为重，友情为辅，避免过早陷入情感纠葛',
        health: '注意作息规律，加强体育锻炼，培养良好生活习惯',
        wealth: '以学习积累为主，不宜过早追求物质财富',
        life: '多读书多思考，建立正确价值观，培养独立人格'
      },
      young: {
        career: '就业创业关键期，宜把握机遇，勇于尝试，积累经验',
        relationship: '感情起步期，宜真诚待人，寻找志同道合伴侣',
        health: '保持活力，注意劳逸结合，避免过度消耗',
        wealth: '开始理财规划，量入为出，为未来做准备',
        life: '拓展视野，建立人脉，确定人生方向'
      },
      prime: {
        career: '事业发展黄金期，宜专注精进，寻求突破',
        relationship: '家庭建设期，平衡事业与家庭，承担责任',
        health: '注意亚健康，定期体检，保持身心平衡',
        wealth: '财富积累期，稳健投资，为家庭提供保障',
        life: '稳中求进，兼顾多重角色，寻求人生意义'
      },
      middle: {
        career: '事业成熟期，宜传帮带，培养后继，规划传承',
        relationship: '子女成长期，言传身教，家庭和谐最重要',
        health: '健康关键期，注重养生，预防慢性疾病',
        wealth: '财富保值期，稳健理财，为养老做准备',
        life: '回望总结，智慧沉淀，寻求精神富足'
      },
      elder: {
        career: '含饴弄孙期，适度参与，传承智慧',
        relationship: '天伦之乐期，享受亲情，淡泊名利',
        health: '养生保健期，顺应自然，身心和谐',
        wealth: '安享晚年期，知足常乐，简单生活',
        life: '智慧沉淀期，传承经验，精神升华'
      }
    };

    return adviceMap[stage.key] || {};
  }

  /**
   * 获取下一个阶段信息
   * @param {Object} currentStage - 当前阶段
   * @returns {Object|null} 下一阶段信息
   */
  getNextStage(currentStage) {
    if (!currentStage) return null;

    const stageKeys = Object.keys(this.stages);
    const currentIndex = stageKeys.indexOf(currentStage.key);

    if (currentIndex < stageKeys.length - 1) {
      const nextKey = stageKeys[currentIndex + 1];
      return { ...this.stages[nextKey], key: nextKey };
    }

    return null;
  }

  /**
   * 获取上一个阶段信息
   * @param {Object} currentStage - 当前阶段
   * @returns {Object|null} 上一阶段信息
   */
  getPreviousStage(currentStage) {
    if (!currentStage) return null;

    const stageKeys = Object.keys(this.stages);
    const currentIndex = stageKeys.indexOf(currentStage.key);

    if (currentIndex > 0) {
      const prevKey = stageKeys[currentIndex - 1];
      return { ...this.stages[prevKey], key: prevKey };
    }

    return null;
  }

  /**
   * 生成年龄段相关的AI提示词
   * @param {Object} ageInfo - 年龄信息
   * @returns {string} AI提示词
   */
  generateAgePrompt(ageInfo) {
    if (!ageInfo.stage) return '';

    const { age, stage, advice } = ageInfo;

    return `## 年龄阶段分析

### 当前年龄阶段：${age}岁，${stage.name}
- **人生重点**：${stage.focus}
- **阶段特征**：这是人生中的${stage.focus}阶段

### 年龄段针对性建议：
- **事业方面**：${advice.career}
- **感情方面**：${advice.relationship}
- **健康方面**：${advice.health}
- **财富方面**：${advice.wealth}
- **人生建议**：${advice.life}

### AI分析要求：
**重要：在分析各个章节时，必须结合用户当前的${stage.name}特点进行针对性分析**
1. **事业分析**要考虑${age}岁的人在${stage.focus}方面的特殊需求和挑战
2. **感情分析**要符合${stage.name}人群的情感特点和需求
3. **健康建议**要针对${age}岁人群的常见健康问题
4. **整体建议**要给出适合${stage.name}的具体行动指导

在白话解心中，要用"你已${age}岁，正值${stage.name}"这样的表述来增强针对性和亲切感。`;
  }
}

module.exports = { AgeStageAnalyzer };