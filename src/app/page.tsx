
"use client"

import { useState } from "react"
import Image from 'next/image'

import { FortuneForm, type FortuneFormValues } from "@/components/fortune-form"
import { FortuneResult } from "@/components/fortune-result"
import { LoadingAnimation } from "@/components/loading-animation"
import { MysticalBackground } from "@/components/mystical-background"
import { YinYangIcon } from "@/components/yin-yang-icon"
import { generateFortuneReadingWithCache, type GenerateFortuneReadingOutput } from "@/ai/flows/generate-fortune-reading-cached"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [fortune, setFortune] = useState<GenerateFortuneReadingOutput | null>(null)
  const { toast } = useToast()

  const handleFormSubmit = async (data: FortuneFormValues) => {
    setIsLoading(true)
    setFortune(null)
    try {
      const result = await generateFortuneReadingWithCache(data)
      setFortune(result)
    } catch (error) {
      console.error("Error getting fortune:", error)
      toast({
        title: "错误",
        description: "抱歉，天机暂时无法显现。请稍后再试。",
        variant: "destructive",
      })
      setFortune(null) 
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFortune(null)
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#0a1628] font-body">
      <Image
        src="/images/background.png"
        alt="Mystical Background"
        fill
        priority
        className="fixed inset-0 object-cover opacity-30 brightness-110 contrast-125"
      />

      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628]/80 via-[#0f2744]/70 to-[#0a1628]/90" />

      <MysticalBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-24 md:pt-28">
        <header className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <YinYangIcon className="w-8 h-8 text-accent" />
          <span className="text-xl font-body text-accent/90">常清阁</span>
        </header>

        <div className="w-full max-w-3xl flex-grow flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingAnimation />
            </div>
          ) : fortune ? (
            <FortuneResult fortuneData={fortune} onReset={handleReset} />
          ) : (
            <FortuneForm onSubmit={handleFormSubmit} isSubmitting={isLoading} />
          )}
        </div>

        <footer className="w-full text-center py-8 text-sm text-accent/70 font-body">
          <p>天地玄黄，宇宙洪荒</p>
        </footer>
      </div>
    </main>
  )
}
