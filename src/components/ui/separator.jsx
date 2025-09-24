import React from "react";

export function Separator({ className = "" }) {
  return <div className={["h-px w-full bg-neutral-200", className].join(" ")} />;
}


