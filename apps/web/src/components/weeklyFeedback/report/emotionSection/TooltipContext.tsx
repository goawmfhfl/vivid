import { createContext, useContext, useState, ReactNode } from "react";

interface TooltipContextType {
  // Valence tooltips
  showValenceTooltip: boolean;
  setShowValenceTooltip: (show: boolean) => void;

  // Quadrant tooltips
  showEngagedTooltip: boolean;
  setShowEngagedTooltip: (show: boolean) => void;

  // Chart interaction states
  hoveredDayIndex: number | null;
  selectedDayIndex: number | null;
  setHoveredDayIndex: (index: number | null) => void;
  setSelectedDayIndex: (index: number | null) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [showValenceTooltip, setShowValenceTooltip] = useState(false);
  const [showEngagedTooltip, setShowEngagedTooltip] = useState(false);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const value: TooltipContextType = {
    showValenceTooltip,
    showEngagedTooltip,
    setShowValenceTooltip,
    setShowEngagedTooltip,
    hoveredDayIndex,
    selectedDayIndex,
    setHoveredDayIndex,
    setSelectedDayIndex,
  };

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
}
