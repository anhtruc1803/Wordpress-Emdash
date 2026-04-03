# README For Agents

## Repo này là gì

Một CLI-first migration assistant cho WordPress -> EmDash-style workflow.

Nó audit, transform, plan và ghi artifact. Nó chưa import thật vào EmDash.

## Trước khi sửa gì

Đọc theo thứ tự:

1. [README.md](C:/Users/anhtr/Documents/WP/README.md)
2. [CODEBASE_INDEX.md](C:/Users/anhtr/Documents/WP/CODEBASE_INDEX.md)
3. [agent/SYSTEM_MAP.md](C:/Users/anhtr/Documents/WP/agent/SYSTEM_MAP.md)
4. [agent/SAFE_EDIT_ZONES.md](C:/Users/anhtr/Documents/WP/agent/SAFE_EDIT_ZONES.md)
5. [agent/HIGH_RISK_ZONES.md](C:/Users/anhtr/Documents/WP/agent/HIGH_RISK_ZONES.md)

## Nguyên tắc làm việc

- không overclaim khả năng import thật
- không làm silent conversion nếu không có fallback
- không đổi shared contract mà không rà soát downstream
- luôn cập nhật tests/docs khi behavior thực thay đổi
