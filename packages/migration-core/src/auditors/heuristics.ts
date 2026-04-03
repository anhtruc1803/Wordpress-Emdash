import type { BuilderOrPluginHint, ShortcodeOccurrence, WordPressContentItem } from "@wp2emdash/shared-types";

interface HintMatcher {
  kind: "builder" | "plugin";
  name: string;
  confidence: "low" | "medium" | "high";
  test: (item: WordPressContentItem, shortcodes: ShortcodeOccurrence[], blockNames: string[]) => boolean;
}

const matchers: HintMatcher[] = [
  {
    kind: "builder",
    name: "Elementor",
    confidence: "high",
    test: (item, shortcodes) =>
      /elementor/i.test(item.rawContent) || shortcodes.some((shortcode) => shortcode.name.startsWith("elementor"))
  },
  {
    kind: "builder",
    name: "WPBakery",
    confidence: "high",
    test: (_, shortcodes) => shortcodes.some((shortcode) => shortcode.name.startsWith("vc_"))
  },
  {
    kind: "builder",
    name: "Divi",
    confidence: "high",
    test: (item, shortcodes) =>
      /et_pb_/i.test(item.rawContent) || shortcodes.some((shortcode) => shortcode.name.startsWith("et_pb_"))
  },
  {
    kind: "builder",
    name: "Beaver Builder",
    confidence: "medium",
    test: (item, shortcodes) =>
      /fl-builder/i.test(item.rawContent) || shortcodes.some((shortcode) => shortcode.name.startsWith("fl_"))
  },
  {
    kind: "plugin",
    name: "Advanced Custom Fields Blocks",
    confidence: "high",
    test: (_, __, blockNames) => blockNames.some((blockName) => blockName.startsWith("acf/"))
  },
  {
    kind: "plugin",
    name: "Kadence Blocks",
    confidence: "medium",
    test: (_, __, blockNames) => blockNames.some((blockName) => blockName.startsWith("kadence/"))
  },
  {
    kind: "plugin",
    name: "WooCommerce Blocks",
    confidence: "medium",
    test: (_, __, blockNames) => blockNames.some((blockName) => blockName.startsWith("woocommerce/"))
  },
  {
    kind: "plugin",
    name: "Contact Form 7",
    confidence: "high",
    test: (_, shortcodes) => shortcodes.some((shortcode) => shortcode.name === "contact-form-7")
  },
  {
    kind: "plugin",
    name: "Gravity Forms",
    confidence: "high",
    test: (_, shortcodes) => shortcodes.some((shortcode) => shortcode.name === "gravityform")
  }
];

export function detectBuilderAndPluginHints(
  item: WordPressContentItem,
  shortcodes: ShortcodeOccurrence[],
  blockNames: string[]
): BuilderOrPluginHint[] {
  return matchers
    .filter((matcher) => matcher.test(item, shortcodes, blockNames))
    .map((matcher) => ({
      kind: matcher.kind,
      name: matcher.name,
      confidence: matcher.confidence,
      evidence: [`item:${item.id}`, `type:${item.type}`]
    }));
}
