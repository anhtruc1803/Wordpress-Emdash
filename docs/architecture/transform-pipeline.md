# Transform Pipeline

## Mục tiêu

Biến raw WordPress content thành output có cấu trúc mà vẫn:

- giữ semantics chính
- tránh mất dữ liệu ngầm
- báo warning ở mức item

## Bước 1: Phân loại content

`structured-transform.ts` kiểm tra:

- shortcode
- risky HTML như iframe/embed/script
- có Gutenberg block hay không

## Bước 2: Parse Gutenberg

Nếu content có block syntax, `parseGutenbergDocument` trả về cây block.

Nếu không có block:

- HTML sẽ được preserve như `html` node
- text thuần sẽ được đưa thành `paragraph`

## Bước 3: Semantic transform

`block-transformers.ts` hỗ trợ:

- paragraph
- heading
- list
- quote
- image
- gallery
- embed
- code
- separator
- table
- html

`group`, `columns`, `column` hiện là passthrough containers.

## Bước 4: Fallback strategy

Khi gặp block không hỗ trợ:

- thêm `unsupportedNodes`
- thêm `fallbackBlocks`
- sinh `StructuredNode` loại `fallback`
- thêm warning `UNSUPPORTED_BLOCK` hoặc `UNKNOWN_BLOCK`

## Bước 5: Warning generation

Warnings hiện sinh từ:

- shortcode
- raw HTML
- embed
- script
- unsupported block
- empty content

Warnings là input quan trọng cho:

- manual fixes
- unresolved items
- recommendation gián tiếp qua audit

## Bước 6: Preview output

`dry-run` và `import` ghi `transform-preview.json`.

Preview này không phải target payload cuối cùng cho EmDash. Nó là intermediate representation để:

- review transform quality
- làm đầu vào cho import planning
- bàn giao cho bước tích hợp tiếp theo
