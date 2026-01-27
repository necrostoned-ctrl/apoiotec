import { useEffect, useState } from "react";

export function useCardLayout() {
  const [layout, setLayout] = useState<"single" | "double">("double");

  useEffect(() => {
    const savedLayout = localStorage.getItem("cardLayout") as "single" | "double" | null;
    if (savedLayout) {
      setLayout(savedLayout);
    }
  }, []);

  const updateLayout = (newLayout: "single" | "double") => {
    setLayout(newLayout);
    localStorage.setItem("cardLayout", newLayout);
    window.dispatchEvent(new CustomEvent("layoutChange", { detail: { layout: newLayout } }));
  };

  const getGridClass = () => {
    return layout === "single" 
      ? "grid-cols-1" 
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  return { layout, updateLayout, getGridClass };
}
