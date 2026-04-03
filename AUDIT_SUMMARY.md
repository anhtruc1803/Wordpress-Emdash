# Audit Summary

## Overall state

Codebase đang ở mức MVP thực dụng:

- có pipeline thật từ source đến artifact
- có package boundaries rõ
- có tests cho các luồng cốt lõi
- chưa có target integration thật

Nó đã vượt mức “scaffold”, nhưng vẫn chưa ở mức production integration.

## Strengths

- contract trung tâm rõ ở `shared-types`
- orchestration dễ đọc ở `pipeline.ts`
- CLI surface nhỏ và dễ hiểu
- fallback strategy an toàn hơn so với aggressive conversion
- artifact generation đủ hữu ích cho review và handoff

## Weaknesses

- adapter import vẫn là stub
- scoring là heuristic, chưa có calibration thực tế
- transform coverage còn giới hạn ở block cốt lõi
- không có live integration tests
- REST connector chưa xử lý auth/rate-limit/retry

## Risk areas

- thay đổi `shared-types` có blast radius lớn
- parser thay đổi có thể làm lệch audit, transform và planner cùng lúc
- report format hiện chưa có versioning
- output path/report encoding cần giữ nhất quán

## What feels production-ish

- monorepo structure
- typed contracts
- deterministic artifact writing
- explicit unresolved/manual-fix handling
- build/typecheck/test workflow

## What remains MVP-only

- EmDash adapter boundary
- builder/plugin heuristics
- transform coverage ngoài Gutenberg core subset
- roadmap/workflow cho private WordPress sources

## Short conclusion

Repo đã là một nền tảng tốt để tiếp tục phát triển migration tooling, nhưng chưa nên được mô tả như một importer hoàn chỉnh cho EmDash.
