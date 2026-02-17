import type { ButtonHTMLAttributes } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "./button";

type ResetButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function ResetButton({ className, ...props }: ResetButtonProps) {
  return (
    <Button
      type="button"
      aria-label="Reset"
      title="Reset"
      variant="outline"
      size="icon"
      className={className ?? "h-7 w-7"}
      {...props}
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
}
