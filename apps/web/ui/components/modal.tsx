"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border-2 border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-xl shadow-black/40">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description ? <p className="mt-2 text-sm text-zinc-300">{description}</p> : null}
          {children ? <div className="mt-4">{children}</div> : null}
          {footer ? <div className="mt-6 flex items-center justify-end gap-3">{footer}</div> : null}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
