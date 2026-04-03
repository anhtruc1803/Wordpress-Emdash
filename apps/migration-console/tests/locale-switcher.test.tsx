import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LocaleProvider } from "@/components/layout/locale-provider";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n/ui";

describe("LocaleSwitcher", () => {
  it("persists the selected locale to localStorage and updates document language", async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="vi">
        <LocaleSwitcher />
      </LocaleProvider>
    );

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.cookie).toContain("wp2emdash-locale=en");
  });
});
