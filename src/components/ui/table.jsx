import React from "react";

export function Table({ className = "", ...props }) {
  return <table className={["w-full border-collapse text-sm", className].join(" ")} {...props} />;
}
export function TableHeader({ className = "", ...props }) {
  return <thead className={className} {...props} />;
}
export function TableBody({ className = "", ...props }) {
  return <tbody className={className} {...props} />;
}
export function TableRow({ className = "", ...props }) {
  return <tr className={className} {...props} />;
}
export function TableHead({ className = "", ...props }) {
  return <th className={["border-b p-2 text-left font-medium", className].join(" ")} {...props} />;
}
export function TableCell({ className = "", ...props }) {
  return <td className={["border-b p-2", className].join(" ")} {...props} />;
}


