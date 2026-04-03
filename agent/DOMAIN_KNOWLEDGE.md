# Domain Knowledge

## Principle

Dự án này tối ưu cho migration an toàn, không tối ưu cho visual fidelity.

## Core domain objects

- `WordPressSourceBundle`: normalized source
- `AuditResult`: site-level migration assessment
- `TransformResult`: item-level transform output
- `ImportPlan`: target-facing plan, chưa phải live import payload

## Những construct quan trọng

- Gutenberg block
- shortcode
- raw HTML
- embed/iframe/object
- script fragment
- custom post type

## Practical meaning của warning/fallback

- warning là tín hiệu review cần thiết
- fallback là cách bảo toàn dữ liệu khi không thể convert an toàn
- manual fix là output thiết kế có chủ đích, không phải lỗi phụ

## Những gì chưa nên giả định

- không giả định EmDash target schema đã rõ
- không giả định mọi WordPress REST site đều public
- không giả định builder/plugin hints là chính xác tuyệt đối
