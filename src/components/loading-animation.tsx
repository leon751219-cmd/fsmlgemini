"use client"

import { YinYangIcon } from "./yin-yang-icon"

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-primary border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-6 flex items-center justify-center">
          <YinYangIcon className="w-12 h-12 text-accent animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-body text-accent animate-pulse">推演天机中...</p>
        <p className="text-sm text-cyan-200/60">请稍候片刻</p>
      </div>
      <div className="flex gap-3">
        <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  )
}
