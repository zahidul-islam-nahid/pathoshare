import React from "react";

export function Label({ className = "", ...props }) {
  return <label className={["text-sm text-neutral-700", className].join(" ")} {...props} />;
}


