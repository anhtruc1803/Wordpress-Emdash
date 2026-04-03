# Security Considerations

## Những điểm tích cực hiện tại

- không execute shortcode/script
- raw HTML/script chỉ được preserve như data và warning
- không có live target mutation trong `import`

## Những điểm cần để ý

- REST connector fetch URL người dùng cung cấp
- artifact có thể chứa raw HTML hoặc script fragments từ nguồn
- report/manual-fix files có thể chứa payload nhạy cảm nếu site nguồn chứa dữ liệu đó

## Rủi ro cụ thể

- SSRF-style concerns nếu sau này chạy trong hạ tầng có network reach cao hơn
- artifact leakage nếu output directory được chia sẻ không kiểm soát
- future adapter có thể mở rộng attack surface nếu không validate target interactions

## Khuyến nghị

- thêm allowlist/validation cho URL khi đưa vào môi trường production
- coi artifact là dữ liệu migration nhạy cảm
- thiết kế target adapter với validation và auth rõ ràng
