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
      className={classNames(
        "rounded-xl border border-rose-400/55 bg-rose-500/12 p-4 text-sm text-rose-100 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 font-medium text-rose-100">
        <CircleX className="h-4 w-4 text-rose-300/85" />
        {title}
      </div>
      <p className="mt-2 whitespace-pre-wrap wrap-break-word text-rose-100/90">{message}</p>
      {cause && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-500/70 bg-slate-900/70 p-3 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap wrap-break-word">
          {cause}
        </pre>
      )}
    </div>
  );
}
