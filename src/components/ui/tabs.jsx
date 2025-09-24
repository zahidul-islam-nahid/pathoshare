import React, { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className={className} data-value={value}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, setValue })
      )}
    </div>
  );
}

export function TabsList({ children, className = "", value, setValue }) {
  return <div className={["inline-flex gap-2", className].join(" ")}>{React.Children.map(children, child => React.cloneElement(child, { value, setValue }))}</div>;
}

export function TabsTrigger({ value: tabValue, children, value, setValue }) {
  const active = value === tabValue;
  return (
    <button onClick={() => setValue(tabValue)} className={["px-3 py-1 rounded-md border", active ? "bg-black text-white" : "bg-white"].join(" ")}>{children}</button>
  );
}

export function TabsContent({ value: tabValue, children, value }) {
  if (value !== tabValue) return null;
  return <div className="mt-3">{children}</div>;
}


