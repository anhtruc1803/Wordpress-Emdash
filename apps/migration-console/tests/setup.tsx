import "@testing-library/jest-dom/vitest";
import React from "react";
import { TextDecoder, TextEncoder } from "node:util";
import { vi } from "vitest";

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

vi.mock("next/link", () => ({
  default: function Link({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
}));
