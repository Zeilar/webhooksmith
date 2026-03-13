import { SiGithub } from "@icons-pack/react-simple-icons";

export function Footer() {
  return (
    <footer className="border-t border-slate-700/75 bg-slate-950/40 px-4 py-4 text-sm text-slate-300 mt-auto">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/zeilar/webhooksmith"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-slate-100"
          >
            <SiGithub className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
