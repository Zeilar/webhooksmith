"use client";

import React, { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Webhook } from "lucide-react";
import { io } from "socket.io-client";

// Monaco must be dynamically imported to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="text-sm font-medium text-zinc-100">{title}</div>
        {subtitle ? <div className="text-xs text-zinc-400">{subtitle}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function WebhookBuilderPage() {
  const [incomingJson, setIncomingJson] = useState<string>(
    `{
  "event": "DownloadComplete",
  "source": "radarr",
  "timestamp": "2026-02-10T12:34:56.000Z",
  "movie": {
    "title": "Dune: Part Two",
    "year": 2024,
    "quality": "WEB-DL 1080p"
  }
}`,
  );

  const [templateJson, setTemplateJson] = useState<string>(
    `{
  "content": "✅ {{movie.title}} ({{movie.year}}) downloaded!",
  "embeds": [
    {
      "title": "{{movie.title}}",
      "description": "Quality: {{movie.quality}}",
      "timestamp": "{{timestamp}}"
    }
  ]
}`,
  );

  const socket = io("webhooksmith.angelin.foo", { secure: true });

  useEffect(() => {
    console.log("socketr");
    socket.on("test", (data) => setIncomingJson(JSON.stringify(JSON.parse(data), null, 2)));
    return () => {
      socket.off("test");
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 w-full">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
            <Webhook className="h-5 w-5 text-zinc-200" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Webhook builder</h1>
            <p className="text-sm text-zinc-400">
              VS Code-style JSON editors with tabs/indentation. Presets are placeholders for now.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Editors */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Panel title="Incoming JSON" subtitle="Read-only for now (this will come from your API).">
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <MonacoEditor
                  height="520px"
                  defaultLanguage="json"
                  value={incomingJson}
                  options={{
                    formatOnPaste: true,
                    formatOnType: true,
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                  theme="vs-dark"
                />
              </div>
            </Panel>

            <Panel title="Template editor" subtitle="Edit output template here. (Validation later.)">
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <MonacoEditor
                  height="520px"
                  language="json"
                  value={templateJson}
                  onChange={(value) => setTemplateJson(value ?? "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                  theme="vs-dark"
                />
              </div>
            </Panel>
          </section>
        </div>
      </div>
    </div>
  );
}
