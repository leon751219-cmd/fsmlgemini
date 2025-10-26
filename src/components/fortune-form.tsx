
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

const formSchema = z.object({
  birthDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "请输入有效的日期" }),
  birthTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: "请输入有效的时间格式 (HH:MM)"}),
  gender: z.enum(["male", "female"], { required_error: "请选择性别" }),
  birthLocation: z.string().min(1, { message: "请输入出生地点" }),
}).refine(data => {
  const date = new Date(data.birthDate);
  const year = date.getFullYear();
  return year >= 1900 && year <= new Date().getFullYear();
}, {
  message: `年份需在1900年和${new Date().getFullYear()}年之间`,
  path: ["birthDate"],
}).refine(data => new Date(data.birthDate) <= new Date(), {
  message: "出生日期不能在未来",
  path: ["birthDate"],
});


export type FortuneFormValues = z.infer<typeof formSchema>

interface FortuneFormProps {
  onSubmit: (data: FortuneFormValues) => void
  isSubmitting: boolean
}

export function FortuneForm({ onSubmit, isSubmitting }: FortuneFormProps) {
  const form = useForm<FortuneFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      birthTime: "",
      gender: undefined,
      birthLocation: "",
    },
  })

  const processSubmit = (data: FortuneFormValues) => {
    onSubmit(data);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="w-full max-w-md mx-auto p-6 md:p-8 bg-card/90 border-cyan-400/20 shadow-2xl shadow-cyan-500/10 animate-border-glow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-balance bg-gradient-to-r from-cyan-200 via-amber-200 to-cyan-200 bg-clip-text text-transparent">
                玄妙洞察
              </h1>
              <p className="text-sm text-cyan-200/70 font-body">输入生辰信息，洞见命运玄机</p>
            </div>

            <div className="space-y-4">
               <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="birthDate" className="text-sm font-medium text-cyan-100/90">出生日期（公历）</Label>
                      <FormControl>
                        <Input
                          id="birthDate"
                          type="date"
                          required
                          className="bg-input border-cyan-400/30 focus:border-cyan-300 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-cyan-400 text-cyan-50 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="birthTime" className="text-sm font-medium text-cyan-100/90">出生时间</Label>
                      <FormControl>
                        <Input
                          id="birthTime"
                          type="time"
                          required
                          className="bg-input border-cyan-400/30 focus:border-cyan-300 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-cyan-400 text-cyan-50 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium text-cyan-100/90">性别</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-input border-cyan-400/30 focus:border-cyan-300 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-cyan-400 text-cyan-50 transition-all">
                            <SelectValue placeholder="请选择性别" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-cyan-400/50 text-cyan-100">
                          <SelectItem value="male">男</SelectItem>
                          <SelectItem value="female">女</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
               <FormField
                control={form.control}
                name="birthLocation"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="birthLocation" className="text-sm font-medium text-cyan-100/90">出生地点</Label>
                    <FormControl>
                      <Input
                        id="birthLocation"
                        type="text"
                        placeholder="例如：北京 或 四川 成都"
                        required
                        className="bg-input border-cyan-400/30 focus:border-cyan-300 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-cyan-400 text-cyan-50 placeholder:text-cyan-400/40 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-cyan-200/50">
                      请填写省、市信息以获得更精确的分析。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-slate-900 font-bold py-6 text-base transition-all duration-300 shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-400/50 hover:scale-[1.02] border border-amber-300/30 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "天机推演中..." : "启示我的命运"}
            </Button>
          </form>
        </Form>
      </Card>
    </motion.div>
  )
}

    