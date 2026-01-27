import * as React from "react"
import { cn } from "@/lib/utils"

// 1. ButtonProps 인터페이스에 'size' 속성을 명시적으로 추가합니다.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon' // 빌드 에러의 원인이었던 부분 해결
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // 2. variant(모양) 스타일 정의
    const variants = {
      default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 shadow-sm",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
      ghost: "hover:bg-slate-100 hover:text-slate-900"
    }
    
    // 3. size(크기) 스타일 정의
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8",
      icon: "h-10 w-10"
    }
    
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-black ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }