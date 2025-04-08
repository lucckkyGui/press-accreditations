
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon: Icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && iconPosition === "left" && (
          <Icon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          className={cn(
            iconPosition === "left" && "pl-8",
            iconPosition === "right" && "pr-8",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <Icon className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
