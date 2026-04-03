# Risk Assessment

## Parser risk

Mức: medium.

Lý do:

- WXR parser giả định cấu trúc export tương đối chuẩn
- REST normalization giả định response shape cơ bản của WP REST
- không có fallback parser cho XML/REST dị biệt

## Transform risk

Mức: medium to high.

Lý do:

- block coverage còn giới hạn
- unsupported blocks dựa vào fallback nên an toàn về data preservation hơn là completeness
- raw HTML preserve có thể làm downstream import phức tạp

## Data loss risk

Mức: medium, nhưng được giảm bởi fallback strategy.

Điểm tốt:

- shortcode raw được giữ
- unsupported block raw được giữ
- HTML raw được giữ

Điểm yếu:

- semantic richness ngoài coverage hiện tại vẫn có thể bị thu gọn

## Reporting risk

Mức: medium.

Lý do:

- report được render từ audit/plan hiện có nên nhất quán với code
- nhưng chưa có schema version hay snapshot compatibility

## Integration risk

Mức: high.

Lý do:

- chưa có EmDash adapter thật
- chưa có target schema mapping
- lệnh `import` có thể bị hiểu quá khả năng nếu không đọc docs

## Maintainability risk

Mức: medium.

Lý do:

- package boundaries tốt
- nhưng `shared-types` là coupling hotspot
- nếu transform/audit lớn dần mà không thêm registry pattern, file có thể phình nhanh
