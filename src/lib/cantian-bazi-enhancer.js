// Cantian AI bazi-mcp 专业八字增强器
const { getBaziDetail } = require('bazi-mcp');

class CantianBaziEnhancer {
  constructor() {
    this.name = 'Cantian AI 八字增强器';
    this.version = '1.0.0';
  }

  /**
   * 增强八字分析 - 使用 Cantian AI 专业算法
   * @param {Object} userInput - 用户输入信息
   * @param {Object} baziInfo - 现有八字信息
   * @returns {Promise<Object>} 增强后的分析结果
   */
  async enhanceBaziAnalysis(userInput, baziInfo) {
    try {
      console.log('🚀 调用 Cantian AI 专业算法增强分析...');

      // 构建标准的公历时间字符串
      const birthDateTime = new Date(`${userInput.birthDate} ${userInput.birthTime}`);
      const solarDatetime = this.formatSolarDatetime(birthDateTime);

      // 性别转换: 1=男, 2=女
      const gender = userInput.gender === 'male' ? 1 : 2;

      console.log('📡 发送请求到 Cantian AI 服务器...');
      console.log('   - 时间:', solarDatetime);
      console.log('   - 性别:', gender === 1 ? '男' : '女');

      // 调用 Cantian AI API
      const professionalResult = await getBaziDetail({
        solarDatetime,
        gender
      });

      // 解析专业结果
      const enhancedAnalysis = this.parseProfessionalResult(professionalResult, baziInfo);

      console.log('✅ Cantian AI 分析完成');
      console.log('   - 八字:', enhancedAnalysis.bazi);
      console.log('   - 日主:', enhancedAnalysis.dayMaster);
      console.log('   - 生肖:', enhancedAnalysis.zodiac);

      return enhancedAnalysis;

    } catch (error) {
      console.error('❌ Cantian AI 分析失败:', error.message);
      // 返回基础分析，不影响系统运行
      return this.getFallbackAnalysis(baziInfo);
    }
  }

  /**
   * 格式化公历时间字符串
   */
  formatSolarDatetime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  /**
   * 解析 Cantian AI 专业分析结果
   */
  parseProfessionalResult(result, baziInfo) {
    try {
      const analysis = {
        // 基础信息
        basicInfo: {
          solar: result.阳历,
          lunar: result.农历,
          bazi: result.八字,
          gender: result.性别,
          zodiac: result.生肖,
          dayMaster: result.日主
        },

        // 四柱详细分析
        fourPillars: {
          year: result.年柱,
          month: result.月柱,
          day: result.日柱,
          hour: result.时柱
        },

        // 命宫身宫
        lifePalace: {
          mingGong: result.命宫,
          shenGong: result.身宫,
          taiYuan: result.胎元,
          taiXi: result.胎息
        },

        // 神煞分析
        shenSha: result.神煞,

        // 大运分析
        daYun: result.大运,

        // 刑冲合会
        xingChongHeHui: result.刑冲合会,

        // 五行分析（从四柱中提取）
        wuxingAnalysis: this.extractWuxingAnalysis(result),

        // 十神分析
        shiShenAnalysis: this.extractShiShenAnalysis(result),

        // 性格特点
        personalityTraits: this.extractPersonalityTraits(result),

        // 事业财运
        careerFortune: this.extractCareerFortune(result),

        // 感情婚姻
        relationshipAnalysis: this.extractRelationshipAnalysis(result),

        // 健康建议
        healthAdvice: this.extractHealthAdvice(result),

        // 专业等级
        professionalGrade: this.calculateProfessionalGrade(result),

        // 原始数据（用于AI参考）
        rawData: result
      };

      return analysis;

    } catch (error) {
      console.error('解析 Cantian AI 结果失败:', error.message);
      return this.getFallbackAnalysis(baziInfo);
    }
  }

  /**
   * 提取五行分析
   */
  extractWuxingAnalysis(result) {
    const wuxing = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

    // 从四柱天干地支统计五行
    ['年柱', '月柱', '日柱', '时柱'].forEach(pillar => {
      if (result[pillar]) {
        // 天干五行
        if (result[pillar].天干?.五行) {
          wuxing[result[pillar].天干.五行]++;
        }
        // 地支五行
        if (result[pillar].地支?.五行) {
          wuxing[result[pillar].地支.五行]++;
        }
      }
    });

    // 分析五行特点
    const total = Object.values(wuxing).reduce((sum, count) => sum + count, 0);
    const dominant = Object.entries(wuxing)
      .filter(([element, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([element]) => element);

    const weak = Object.entries(wuxing)
      .filter(([element, count]) => count === 0)
      .map(([element]) => element);

    return {
      distribution: wuxing,
      total: total,
      dominant: dominant,
      weak: weak,
      balance: this.calculateBalance(wuxing),
      analysis: this.generateWuxingAnalysis(wuxing, dominant, weak)
    };
  }

  /**
   * 提取十神分析
   */
  extractShiShenAnalysis(result) {
    const shiShen = {};

    ['年柱', '月柱', '日柱', '时柱'].forEach(pillar => {
      if (result[pillar]) {
        // 天干十神
        if (result[pillar].天干?.十神) {
          const god = result[pillar].天干.十神;
          shiShen[god] = (shiShen[god] || 0) + 1;
        }
        // 地支藏干十神
        if (result[pillar].地支?.藏干) {
          Object.values(result[pillar].地支.藏干).forEach(canggan => {
            if (canggan?.十神) {
              const god = canggan.十神;
              shiShen[god] = (shiShen[god] || 0) + 1;
            }
          });
        }
      }
    });

    return {
      distribution: shiShen,
      dominant: Object.entries(shiShen)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([god]) => god),
      analysis: this.generateShiShenAnalysis(shiShen, result.日主)
    };
  }

  /**
   * 提取性格特点
   */
  extractPersonalityTraits(result) {
    const traits = [];

    // 基于日主分析
    const dayMaster = result.日主;
    const wuxingAnalysis = this.extractWuxingAnalysis(result);
    const shiShenAnalysis = this.extractShiShenAnalysis(result);

    // 基于五行生成性格特点
    if (wuxingAnalysis.dominant.includes('木')) {
      traits.push('性格正直，有上进心，富有创造力');
    }
    if (wuxingAnalysis.dominant.includes('火')) {
      traits.push('热情开朗，积极主动，有领导才能');
    }
    if (wuxingAnalysis.dominant.includes('土')) {
      traits.push('稳重踏实，有责任心，值得信赖');
    }
    if (wuxingAnalysis.dominant.includes('金')) {
      traits.push('讲义气，有决断力，执行力强');
    }
    if (wuxingAnalysis.dominant.includes('水')) {
      traits.push('聪明机智，适应性强，善于沟通');
    }

    // 基于十神生成性格特点
    if (shiShenAnalysis.dominant.includes('正官')) {
      traits.push('守规矩，有责任感，适合管理工作');
    }
    if (shiShenAnalysis.dominant.includes('正财')) {
      traits.push('务实稳重，善于理财，重视物质基础');
    }
    if (shiShenAnalysis.dominant.includes('食神')) {
      traits.push('温和善良，富有艺术天赋，生活乐观');
    }

    return traits.join('；') || '性格温和，待人真诚，具有发展潜力';
  }

  /**
   * 提取事业财运
   */
  extractCareerFortune(result) {
    const analysis = [];

    // 基于十神分析事业
    const shiShenAnalysis = this.extractShiShenAnalysis(result);

    if (shiShenAnalysis.dominant.includes('正官')) {
      analysis.push('事业方面适合从事管理、行政等稳定工作，有官职之象');
    }
    if (shiShenAnalysis.dominant.includes('七杀')) {
      analysis.push('事业心强，适合创业、军警、销售等竞争性行业');
    }
    if (shiShenAnalysis.dominant.includes('正财')) {
      analysis.push('财运稳定，善于经营，适合实体产业、金融投资');
    }
    if (shiShenAnalysis.dominant.includes('偏财')) {
      analysis.push('偏财运佳，适合投机、贸易、网络创业等多元化发展');
    }

    // 基于大运分析当前运势
    if (result.大运?.大运 && result.大运.大运.length > 0) {
      const currentYear = new Date().getFullYear();
      const currentDaYun = result.大运.大运.find(daYun =>
        currentYear >= daYun.开始年份 && currentYear <= daYun.结束
      );

      if (currentDaYun) {
        analysis.push(`当前大运为${currentDaYun.干支}，${currentDaYun.开始年龄}-${currentDaYun.结束年龄}岁，事业发展${this.getDaYunFortune(currentDaYun)}`);
      }
    }

    return analysis.join('；') || '事业发展需要根据大运时机把握，建议稳中求进';
  }

  /**
   * 提取感情婚姻分析
   */
  extractRelationshipAnalysis(result) {
    const analysis = [];

    // 基于性别和日主分析
    const gender = result.性别;
    const dayMaster = result.日主;

    // 基于十神分析感情
    const shiShenAnalysis = this.extractShiShenAnalysis(result);

    if (gender === '男') {
      if (shiShenAnalysis.dominant.includes('正财')) {
        analysis.push('感情专一，适合早婚，妻子贤惠持家');
      }
      if (shiShenAnalysis.dominant.includes('偏财')) {
        analysis.push('异性缘佳，但需注意专一，避免感情波折');
      }
    } else {
      if (shiShenAnalysis.dominant.includes('正官')) {
        analysis.push('重视伴侣，丈夫有责任感，婚姻稳定');
      }
      if (shiShenAnalysis.dominant.includes('七杀')) {
        analysis.push('对伴侣要求高，感情较为激烈，需要相互理解');
      }
    }

    // 基于神煞分析感情
    if (result.神煞) {
      const hasTaoHua = Object.values(result.神煞).some(pillar =>
        Array.isArray(pillar) && pillar.includes('桃花')
      );
      if (hasTaoHua) {
        analysis.push('命带桃花，异性缘好，个人魅力突出');
      }
    }

    return analysis.join('；') || '感情和谐，需要双方共同经营，相互理解支持';
  }

  /**
   * 提取健康建议
   */
  extractHealthAdvice(result) {
    const advice = [];
    const wuxingAnalysis = this.extractWuxingAnalysis(result);

    // 基于五行强弱给出健康建议
    if (wuxingAnalysis.weak.includes('木')) {
      advice.push('注意肝胆保养，多吃绿色蔬菜，保持良好作息');
    }
    if (wuxingAnalysis.weak.includes('火')) {
      advice.push('注意心脏血管健康，适当运动，保持心情愉快');
    }
    if (wuxingAnalysis.weak.includes('土')) {
      advice.push('注意脾胃保养，饮食规律，避免暴饮暴食');
    }
    if (wuxingAnalysis.weak.includes('金')) {
      advice.push('注意呼吸系统健康，多呼吸新鲜空气，避免烟酒');
    }
    if (wuxingAnalysis.weak.includes('水')) {
      advice.push('注意肾脏保养，多喝水，避免过度劳累');
    }

    // 基于四柱强弱给出建议
    if (wuxingAnalysis.balance === '偏强') {
      advice.push('体质较好，但要注意劳逸结合，避免过度消耗');
    }
    if (wuxingAnalysis.balance === '偏弱') {
      advice.push('体质相对较弱，需要加强营养，适当锻炼');
    }

    return advice.join('；') || '身体健康状况良好，保持规律作息和适量运动';
  }

  /**
   * 计算五行平衡
   */
  calculateBalance(wuxing) {
    const values = Object.values(wuxing);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    if (range <= 1) return '很平衡';
    if (range <= 2) return '较平衡';
    if (range <= 3) return '一般';
    if (range <= 4) return '不平衡';
    return '很不平衡';
  }

  /**
   * 生成五行分析文字
   */
  generateWuxingAnalysis(wuxing, dominant, weak) {
    const balance = this.calculateBalance(wuxing);
    let analysis = `五行${balance}，`;

    if (dominant.length > 0) {
      analysis += `${dominant.join('、')}较旺，`;
    }
    if (weak.length > 0) {
      analysis += `${weak.join('、')}较弱，`;
    }

    if (weak.length > 0) {
      analysis += `建议在生活中多补益${weak.join('、')}相关的元素`;
    } else {
      analysis += '五行配置相对均衡';
    }

    return analysis;
  }

  /**
   * 生成十神分析文字
   */
  generateShiShenAnalysis(shiShen, dayMaster) {
    if (Object.keys(shiShen).length === 0) {
      return '十神配置均衡，各方面发展较为平均';
    }

    const dominant = Object.entries(shiShen)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([god]) => god);

    let analysis = `日主为${dayMaster}，`;

    if (dominant.length > 0) {
      analysis += `十神以${dominant.join('、')}为主，`;
      analysis += this.getShiShenCharacteristics(dominant);
    }

    return analysis;
  }

  /**
   * 获取十神特征
   */
  getShiShenCharacteristics(gods) {
    const characteristics = {
      '正官': '责任感强，适合管理工作',
      '七杀': '魄力大，事业心强',
      '正财': '务实稳重，善于理财',
      '偏财': '交际能力强，有商业头脑',
      '食神': '温和善良，有艺术天赋',
      '伤官': '聪明机智，富有创意',
      '正印': '有学问，得贵人相助',
      '偏印': '思维独特，有特殊技能',
      '比肩': '有主见，独立性强',
      '劫财': '讲义气，社交能力强'
    };

    return gods.map(god => characteristics[god] || god).join('，');
  }

  /**
   * 获取大运运势描述
   */
  getDaYunFortune(daYun) {
    // 这里可以根据大运的天干地支组合来判断运势
    // 简化版本，实际应该更复杂
    return '运势平稳，宜把握机遇';
  }

  /**
   * 计算专业等级
   */
  calculateProfessionalGrade(result) {
    let score = 70; // 基础分

    // 基于五行平衡加分
    const wuxingAnalysis = this.extractWuxingAnalysis(result);
    if (wuxingAnalysis.balance === '很平衡') score += 15;
    if (wuxingAnalysis.balance === '较平衡') score += 10;
    if (wuxingAnalysis.balance === '一般') score += 5;

    // 基于神煞加分
    if (result.神煞) {
      const shenShaCount = Object.values(result.神煞)
        .filter(pillar => Array.isArray(pillar))
        .reduce((total, pillar) => total + pillar.length, 0);

      if (shenShaCount >= 8) score += 10;
      else if (shenShaCount >= 5) score += 5;
    }

    // 基于刑冲合会加分
    if (result.刑冲合会) {
      const hasGoodRelations = Object.values(result.刑冲合会)
        .some(pillar => pillar.合 && pillar.合.length > 0);
      if (hasGoodRelations) score += 5;
    }

    // 确定等级
    if (score >= 90) return '上等八字';
    if (score >= 80) return '中上八字';
    if (score >= 70) return '中等八字';
    if (score >= 60) return '中下八字';
    return '普通八字';
  }

  /**
   * 降级分析（网络失败时使用）
   */
  getFallbackAnalysis(baziInfo) {
    return {
      basicInfo: {
        solar: baziInfo.solar || '未知',
        lunar: baziInfo.lunar || '未知',
        bazi: baziInfo.bazi ? `${baziInfo.bazi.year} ${baziInfo.bazi.month} ${baziInfo.bazi.day} ${baziInfo.bazi.time}` : '未知',
        zodiac: baziInfo.zodiac || '未知',
        dayMaster: '未知'
      },
      professionalGrade: '普通八字',
      wuxingAnalysis: '需要详细计算后才能分析',
      personalityTraits: '基于八字基础分析，需要更多信息',
      careerFortune: '事业运势需要结合大运分析',
      relationshipAnalysis: '感情状况需要综合分析',
      healthAdvice: '健康建议需要根据五行配置给出',
      rawData: null
    };
  }

  /**
   * 生成专业指导（用于AI Prompt）
   */
  generateProfessionalGuidance(enhancedAnalysis) {
    const {
      basicInfo,
      wuxingAnalysis,
      personalityTraits,
      careerFortune,
      relationshipAnalysis,
      healthAdvice,
      professionalGrade,
      shiShenAnalysis
    } = enhancedAnalysis;

    return `## Cantian AI 专业命理指导

### 八字等级评定
- **专业评分**: ${enhancedAnalysis.professionalGrade === '上等八字' ? '90+' : enhancedAnalysis.professionalGrade === '中上八字' ? '80+' : enhancedAnalysis.professionalGrade === '中等八字' ? '70+' : '60+'}分
- **八字等级**: ${professionalGrade}
- **日主**: ${basicInfo.dayMaster}
- **分析依据**: 基于Cantian AI专业八字算法，包含传统命理学完整体系

### 五行深度分析
${wuxingAnalysis.analysis}

### 十神特点分析
${shiShenAnalysis.analysis}

### 性格特点分析
${personalityTraits}

### 事业财运指导
${careerFortune}

### 感情婚姻建议
${relationshipAnalysis}

### 健康养生之道
${healthAdvice}

### 四柱详细结构
- **年柱**: ${basicInfo.bazi.split(' ')[0]}
- **月柱**: ${basicInfo.bazi.split(' ')[1]}
- **日柱**: ${basicInfo.bazi.split(' ')[2]}
- **时柱**: ${basicInfo.bazi.split(' ')[3]}

---

**重要提醒**: 请根据以上Cantian AI专业分析，结合用户的实际情况进行深度解读。确保分析达到专业命理师水准，为用户提供准确、实用的人生指导。`;
  }
}

module.exports = { CantianBaziEnhancer };