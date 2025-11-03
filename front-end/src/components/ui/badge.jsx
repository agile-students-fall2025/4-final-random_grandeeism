import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./utils";
import { badgeVariants } from "./shared-variants";

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
