import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  color: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  color,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
        style={{
          borderColor: "#EFE9E3",
          color: currentPage === 1 ? "#E0E0E0" : color,
          backgroundColor: "white",
        }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="w-8 h-8 rounded-full transition-all"
            style={{
              backgroundColor: currentPage === page ? color : "transparent",
              color: currentPage === page ? "white" : color,
              fontSize: "0.85rem",
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
        style={{
          borderColor: "#EFE9E3",
          color: currentPage === totalPages ? "#E0E0E0" : color,
          backgroundColor: "white",
        }}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
