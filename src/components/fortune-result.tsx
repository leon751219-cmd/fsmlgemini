"use client"

import { useRef, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GenerateFortuneReadingOutput } from "@/ai/flows/generate-fortune-reading"
import { motion } from "framer-motion"
import { FileDown, Moon, Loader2 } from "lucide-react"
import { generateReportImage } from "@/lib/generate-report-image"
import { useToast } from "@/hooks/use-toast"

interface FortuneResultProps {
  fortuneData: GenerateFortuneReadingOutput
  onReset: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

export function FortuneResult({ fortuneData, onReset }: FortuneResultProps) {
  const { classicalReading, vernacularReading, summary } = fortuneData
  const [isSaving, setIsSaving] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!reportRef.current) return
    setIsSaving(true)
    try {
      await generateReportImage(reportRef.current)
    } catch (error) {
      console.error("Error saving image:", error)
      toast({
        title: "生成失败",
        description: "抱歉，无法生成命理书页，请稍后再试。",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-3xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div ref={reportRef} className="bg-[#0a1628] p-4">
        <Card className="w-full p-4 md:p-6 backdrop-blur-xl bg-black/20 border-cyan-400/20 shadow-2xl shadow-cyan-500/10 text-gray-200">
          <motion.div variants={itemVariants} className="text-center space-y-3 mb-6">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-balance bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              命运启示
            </h2>
            <p className="text-sm text-cyan-100/80 font-body">天机已现，命理昭然</p>
          </motion.div>

          <Tabs defaultValue="classical" className="w-full">
            <motion.div variants={itemVariants}>
              <TabsList className="grid w-full grid-cols-2 bg-cyan-950/40 border border-cyan-400/20">
                <TabsTrigger value="classical">文言开示</TabsTrigger>
                <TabsTrigger value="vernacular">白话解心</TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="classical" className="mt-4">
              <motion.div variants={itemVariants}>
                <Card className="bg-black/20 p-4 md:p-6 border-cyan-700/30">
                  <div className="space-y-6">
                    {classicalReading.sections.map((section, index) => (
                      <div key={index} className="bg-cyan-950/20 rounded-lg border border-cyan-400/20 px-4 py-3">
                        <h3 className="section-title text-lg font-semibold font-headline text-amber-300">{section.title}</h3>
                        <div className="classical-reading fortune-content">
                          {section.content.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="text-gray-300 font-body text-sm md:text-base">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        {section.comment && (
                          <div className="teacher-comment">
                            🏮 师者评语：{section.comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="vernacular" className="mt-4">
              <motion.div variants={itemVariants}>
                 <Card className="bg-black/20 p-4 md:p-6 border-cyan-700/30">
                    <div className="w-full space-y-4">
                      {vernacularReading.sections.map((section, index) => {
                        // 为每个章节定义对应的符号
                        const getSectionIcon = (title: string) => {
                          // 如果标题已经包含符号，直接返回空字符串
                          if (title.match(/^[📜🌿🧠🌳❤️🍃⭐]/)) {
                            return '';
                          }
                          // 否则根据标题内容添加符号
                          if (title.includes('八字命盘')) return '📜';
                          if (title.includes('五行生克')) return '🌿';
                          if (title.includes('心性天赋')) return '🧠';
                          if (title.includes('官禄事业')) return '🌳';
                          if (title.includes('姻缘情感')) return '❤️';
                          if (title.includes('康健关要')) return '🍃';
                          if (title.includes('流年岁运')) return '⭐';
                          return '📜';
                        };
                        
                        return (
                        <div key={index} className="bg-cyan-950/20 rounded-lg border border-cyan-400/20 px-4 py-3">
                          <h3 className="section-title text-base font-semibold font-headline text-cyan-100">
                            <span className="mr-2">{getSectionIcon(section.title)}</span>
                            {section.title}
                          </h3>
                          <div className="vernacular-reading fortune-content">
                            {section.content.split('\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="text-gray-300 font-body text-sm md:text-base">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div variants={itemVariants} className="my-8 text-center p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-600/30">
            <p className="text-lg italic text-amber-200">“{summary}”</p>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-8 mb-4">
            <p className="text-cyan-200/80">常清阁祝愿：愿君道心常明，慧根深植，福泽悠长。</p>
          </motion.div>
        </Card>
      </div>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mt-6">
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full text-base py-6 bg-cyan-950/50 border-cyan-400/40 text-cyan-100 hover:bg-cyan-900 hover:text-white transition-all duration-300"
          disabled={isSaving}
        >
          <Moon className="mr-2" /> 再启天机
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full text-base py-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 font-bold hover:shadow-xl hover:shadow-amber-400/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-75 disabled:cursor-wait"
        >
          {isSaving ? (
            <><Loader2 className="mr-2 animate-spin" /> 正在生成...</>
          ) : (
            <><FileDown className="mr-2" /> 保存命理书页</>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}
