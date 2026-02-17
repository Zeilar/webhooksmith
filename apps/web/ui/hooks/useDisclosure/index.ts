"use client";

import { useState } from "react";

export interface DisclosureSetters {
  open(): void;
  close(): void;
  toggle(): void;
}

export type Disclosure = [boolean, DisclosureSetters];

export function useDisclosure(initialIsOpen = false): Disclosure {
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((p) => !p);

  return [isOpen, { toggle, open, close }];
}
