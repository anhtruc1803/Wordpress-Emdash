# Module Audit

## `shared-types`

- Quality: strong
- Why: contract rõ, naming dễ hiểu
- Risk: thành coupling hotspot nếu model tiếp tục phình to

## `migration-core/connectors`

- Quality: fair
- Why: đủ cho MVP, mapping dễ đọc
- Risk: REST connector cần auth/retry/error taxonomy

## `migration-core/parsers`

- Quality: good
- Why: trách nhiệm rõ, không over-abstract
- Risk: WXR variants thực tế có thể đa dạng hơn fixture hiện có

## `migration-core/auditors`

- Quality: good
- Why: mang giá trị sản phẩm rõ nhất hiện tại
- Risk: heuristic và scoring cần calibration theo site thật

## `migration-core/transformers`

- Quality: good for MVP
- Why: fallback-aware và bảo thủ
- Risk: coverage giới hạn, `block-transformers.ts` có thể phình nhanh

## `migration-core/planners`

- Quality: fair to good
- Why: output hữu ích, logic trực tiếp
- Risk: import plan chưa gắn target schema thật

## `migration-core/reporters`

- Quality: good
- Why: nhỏ, tập trung, dễ thay đổi
- Risk: format chưa versioned

## `migration-cli`

- Quality: good
- Why: mỏng, ít logic, help text rõ
- Risk: command `import` cần docs rất rõ để tránh hiểu nhầm
