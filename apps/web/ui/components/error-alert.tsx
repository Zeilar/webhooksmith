import { CircleX } from "lucide-react";
import classNames from "classnames";

type ErrorAlertProps = {
  title: string;
  message: string;
  cause?: string | null;
  className?: string;
};

export function ErrorAlert({ title, message, cause, className }: ErrorAlertProps) {
  return (
    <div
      className={classNames("rounded-xl border border-rose-900/40 to-zinc-950 p-4 text-sm text-zinc-100", className)}
    >
      <div className="flex items-center gap-2 font-medium text-zinc-100">
        <CircleX className="h-4 w-4 text-rose-400/80" />
        {title}
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-zinc-300">{message}</p>
      {cause && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 font-mono text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
          {cause}
        </pre>
      )}
    </div>
  );
}
