# Audit Pipeline

## Mục tiêu

Audit trả lời ba câu hỏi:

1. Site này có gì để migrate?
2. Phần nào an toàn, phần nào rủi ro?
3. Mức độ khó migration hiện tại là gì?

## Bước audit hiện có

### Content inventory

Đếm:

- `post`
- `page`
- custom post type
- `attachment` từ media collection

### Block inventory

Từ Gutenberg parse:

- đếm block names
- đánh dấu supported hay unsupported

### Shortcode inventory

Regex detect trên raw content và gom theo shortcode name.

### Builder/plugin hints

Heuristic hiện dò:

- Elementor
- WPBakery
- Divi
- Beaver Builder
- ACF Blocks
- Kadence Blocks
- WooCommerce Blocks
- Contact Form 7
- Gravity Forms

### Risky construct detection

- raw HTML legacy content
- iframe/embed/object
- script fragments

### Difficulty scoring

`difficulty.ts` quy đổi counts/risk signals sang:

- `score`
- `level`
- `reasons`

### Recommendation

Từ difficulty và unresolved count:

- `ready for import`
- `import with manual cleanup`
- `rebuild recommended`

## Giới hạn hiện tại

- audit không có confidence score theo từng issue
- không có source location sâu hơn `itemId`
- heuristic chưa có cấu hình theo plugin/project
