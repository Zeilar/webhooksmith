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
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border border-slate-700/75 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/30">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && <p className="mt-2 text-sm">{description}</p>}
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-4 flex items-center justify-end gap-2">{footer}</div>}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
