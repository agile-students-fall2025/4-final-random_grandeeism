import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./utils";

const Loader = React.forwardRef(({ className, size = 16, ...props }, ref) => {
  return (
    <Loader2
      ref={ref}
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  );
});
Loader.displayName = "Loader";

export { Loader };
