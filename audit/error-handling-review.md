# Error Handling Review

## Hiện trạng

Error handling hiện khá trực tiếp:

- connector REST `throw Error` khi fetch fail
- parser WXR `throw Error` khi XML không đúng shape tối thiểu
- CLI bắt lỗi ở top-level và set exit code `1`

## Điểm tốt

- behavior dễ hiểu
- failure không bị nuốt im lặng
- CLI trả thông báo ngắn gọn

## Điểm yếu

- chưa có error classes riêng
- chưa có phân loại theo source/parse/transform/plan/artifact
- chưa có retryable vs non-retryable distinction

## Tác động

- người dùng khó biết bước nào fail nếu stack không được đọc sâu
- AI agent khó làm automated remediation thông minh

## Khuyến nghị

- thêm error taxonomy nhẹ
- thêm context vào message lỗi quan trọng
- giữ top-level CLI handler mỏng nhưng rõ hơn về origin của lỗi
