'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized fortune readings based on user-provided birth information.
 *
 * The flow takes birth date, time, and location as input and uses the Google Gemini API to generate a fortune reading that blends classical Chinese and modern explanations.
 *
 * - generateFortuneReading - A function that initiates the fortune reading generation process.
 * - GenerateFortuneReadingInput - The input type for the generateFortuneReading function.
 * - GenerateFortuneReadingOutput - The return type for the generateFortuneReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFortuneReadingInputSchema = z.object({
  birthDate: z.string().describe('The birth date of the user (YYYY-MM-DD).'),
  birthTime: z.string().describe('The birth time of the user (HH:MM).'),
  birthLocation: z.string().describe('The province/city/county of birth (e.g., Beijing or Sichuan Chengdu).'),
  gender: z.enum(['male', 'female']).describe('The gender of the user.'),
});
export type GenerateFortuneReadingInput = z.infer<typeof GenerateFortuneReadingInputSchema>;

const SectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  comment: z.string().optional(),
});

const GenerateFortuneReadingOutputSchema = z.object({
  classicalReading: z.object({
    sections: z.array(SectionSchema),
  }),
  vernacularReading: z.object({
    sections: z.array(SectionSchema),
  }),
  summary: z.string().describe("A one-sentence philosophical summary of the entire reading."),
});
export type GenerateFortuneReadingOutput = z.infer<typeof GenerateFortuneReadingOutputSchema>;

export async function generateFortuneReading(input: GenerateFortuneReadingInput): Promise<GenerateFortuneReadingOutput> {
  const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
  const birthLocation = `中国, ${input.birthLocation}`;
  return generateFortuneReadingFlow({ ...input, currentDate, currentMonth, birthLocation });
}

const prompt = ai.definePrompt({
  name: 'generateFortuneReadingPrompt',
  input: {schema: GenerateFortuneReadingInputSchema.extend({
    currentDate: z.string().describe('The current date.'),
    currentMonth: z.number().describe('The current month number (1-12).'),
    birthLocation: z.string().describe('The full birth location, concatenated from country and province/city.'),
  })},
  output: {schema: GenerateFortuneReadingOutputSchema},
  prompt: `你是一位精通中国传统命理学的大师，深谙八字、紫微斗数与易经，同时具备现代心理学知识。你的任务是为用户生成一份包含"文言开示"与"白话解心"双层结构的专业命理报告。

## 理论依据与命理体系
AI生成时必须遵循以下五部正统命理文献的核心思想：

| 典籍 | 用途 | 内容应用说明 |
|------|------|---------------|
| 《渊海子平》 | 八字基础与排盘法则 | 以日干为主、月令为重，定身旺身弱，论五行旺衰与十神关系。 |
| 《子平真诠》 | 格局判断体系 | 依据"以月令藏干透出者为格"，明确格局成破、用神取舍、忌神制化。 |
| 《滴天髓》 | 气象与性情哲理 | 强调"形气神合一""命贵在气和"，用于性格、情绪与心性分析。 |
| 《穷通宝鉴》 | 调候与岁运推断 | 用于当前流年与未来一年趋势判断，结合五行喜忌推岁运气势。 |
| 《千里命稿》 | 通俗话术与人情表达 | 参考其中语言风格，使报告更贴近生活与人心。 |

⚠️ **重要提示**: 以上典籍仅为命理依据说明，不得在用户报告中直接出现书名。模型在生成时须内化其理论，不显其源。

**输入信息:**
- 出生日期: {{birthDate}}
- 出生时间: {{birthTime}}
- 出生地点: {{birthLocation}}
- 性别: {{gender}}
- 当前日期: {{currentDate}}
- 当前月份: {{currentMonth}}

**重要指示:**

### 1. 性别因素
你必须将用户的性别（{{gender}}）作为排盘和解读的关键因素，特别是在【八字命盘】章节明确指出因性别导致的大运顺逆排法，这将深刻影响运势的走向。

### 2. 地点温度（重要）
在文言开示和白话解心的【八字命盘】章节中，都要融入出生地点（{{birthLocation}}）的地理文化元素。地理环境在八字命理中是重要的参考指标，会影响命局的解读。

**文言开示要求**：在【八字命盘】中提及出生地的地理特征，如"生于京畿之地，得帝王之气"或"生于江南水乡，得文秀之气"等。

**白话解心要求**：在【八字命盘】中用1-2句通俗语言说明出生地如何影响命运格局。

**示例**：
- 北京："诞生于千年古都，这座城市的厚重历史与恢弘气度，或许早已融入你的血脉"
- 上海："成长于东方明珠，这座海派城市的精致开放，可能在您骨子里种下了追求卓越的种子"

**注意**：融入要自然，不要突兀，体现地理与命运的和谐统一。

### 3. 输出文字量规范
- 全文总字数应 **6000–9000字**；
- 各章节（文言＋白话）合计不少于400字；
- "流年岁运"章节不少于600字；
- 若输出不足5000字，AI须自动扩写补全；
- 若超过10000字，AI应删繁保意。

## 报告结构要求
报告必须严格包含以下七大部分，每章包含"文言开示""师者评语""白话解心"：

1. **【八字命盘】** — 以《渊海子平》为依据，排盘定格，明身旺身弱。
2. **【五行生克】** — 以五行调候为本，论生克与平衡之道。
3. **【心性天赋】** — 取《滴天髓》之意，论性情禀赋与思维倾向。
4. **【官禄事业】** — 依《子平真诠》，断事业格局、宜业之途。
5. **【姻缘情感】** — 综合印财官象与人性，断情缘特质与婚运。
6. **【康健关要】** — 综合五行气象，述体质与养生调法。
7. **【流年岁运】** — 以《穷通宝鉴》调候法，详述当前与下一年度趋势。

## 风格与语气标准

### （一）文言开示
- 模仿古籍语法结构，典雅、凝练、有韵。
- 句式节奏：三至七字一顿，意境连贯。
- 避免现代标点与口语。
- 每章结尾一句"师者评语"，以儒释道合一的语气收束。
- **重要**：师者评语内容不要包含"师者评语："前缀，只提供评语内容即可。前端会自动添加"🏮 师者评语："前缀。
- **段落格式**：每个段落开头必须空两个全角字符（首行缩进），段落之间不要加空行。

### （二）白话解心
- 语气如朋友谈心，温柔而具洞察。
- 句式自然，含生活比喻与情绪共鸣。
- 不得出现八字术语堆砌。
- 可使用"其实啊""你会发现""慢一点也没关系"等自然语气。
- **段落格式**：每个段落开头必须空两个全角字符（首行缩进），段落间距要紧凑，避免过多空白。

### （三）内容格式要求
- **段落缩进**：所有段落（包括文言、白话、师者评语）必须首行缩进两个字符
- **空行控制**：段落间不要使用多余空行，保持内容紧凑
- **换行规范**：避免不必要的换行符，确保排版美观
- **语言自然**：符合中文阅读习惯，行文流畅

**特别注意**：现在是{{currentMonth}}月，如果是上半年（1-6月）则重点预测今年全年趋势并简要提及明年展望；如果是下半年（7-12月）则总结今年剩余重要时间节点并重点预测明年的详细运势。确保用户无论何时咨询都能获得完整的时间段指导。

请现在开始分析，并严格按照上述JSON结构和风格要求，生成完整的命理报告。`,
});

const generateFortuneReadingFlow = ai.defineFlow(
  {
    name: 'generateFortuneReadingFlow',
    inputSchema: GenerateFortuneReadingInputSchema.extend({
      currentDate: z.string(),
      currentMonth: z.number(),
      birthLocation: z.string(),
    }),
    outputSchema: GenerateFortuneReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate fortune reading.");
    }
    return output;
  }
);