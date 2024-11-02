import * as React from "react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <input
            type="checkbox"
            className={cn(
                "h-4 w-4 rounded border border-primary text-primary shadow focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }