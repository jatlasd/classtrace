import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import * as Slot from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,transform] outline-none select-none focus-visible:ring-2 focus-visible:ring-live-bright focus-visible:ring-offset-2 focus-visible:ring-offset-base active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-live-bright text-live-fg hover:bg-[#ffc24d]",
        solid: "bg-fg text-[color:var(--base)] hover:bg-[#3d3157]",
        outline:
          "border-line-2 bg-transparent text-fg hover:bg-plate aria-expanded:bg-plate",
        secondary: "bg-well text-fg hover:bg-[#ede7f5] aria-expanded:bg-[#ede7f5]",
        ghost:
          "text-fg-2 hover:bg-plate hover:text-fg aria-expanded:bg-plate aria-expanded:text-fg",
        destructive:
          "border-danger/40 bg-transparent text-danger hover:bg-danger hover:text-[color:var(--base)] focus-visible:ring-danger",
        link: "text-fg underline decoration-line-2 underline-offset-4 hover:decoration-fg",
      },
      size: {
        default: "h-11 gap-2 px-4 lg:h-10 lg:px-3.5",
        xs: "h-9 gap-1 px-2.5 text-xs lg:h-7 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 gap-1.5 px-3 text-[13px] lg:h-8 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-[15px]",
        icon: "size-11 lg:size-10",
        "icon-xs": "size-9 lg:size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10 lg:size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
