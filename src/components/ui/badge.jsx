import React from "react";

export function Badge({ className = "", ...props }) {
  return <span className={["inline-flex items-center rounded-full border px-2 py-0.5 text-xs", className].join(" ")} {...props} />;
}


