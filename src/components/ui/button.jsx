import React from "react";

export function Button({ className = "", variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-black text-white hover:bg-black/90",
    secondary: "bg-white text-black border hover:bg-neutral-50",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6",
  };
  return (
    <button className={[base, variants[variant], sizes[size], className].filter(Boolean).join(" ")} {...props} />
  );
}


