"use client";

import { useTheme } from "../../hooks/useTheme.js";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { effectiveTheme } = useTheme();

  return (
    <Sonner
      theme={effectiveTheme === "dark" ? "dark" : "light"}
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        }
      }
      {...props}
    />
  );
};

export { Toaster };
