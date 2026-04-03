# Import Planning

## Planning hiện làm gì

`createImportPlan` biến source + transform output thành một kế hoạch nhập dữ liệu ở mức logic.

Nó tạo:

- collection mapping
- entries to create
- media import list
- rewrite suggestions
- unresolved items
- manual fixes

## Collection mapping

Hiện mapping mặc định:

- `post -> posts`
- `page -> pages`
- type khác -> plural hóa đơn giản

Đây là rule MVP, chưa có config per project.

## Entries

Mỗi entry trong plan chứa:

- source identity
- target collection
- slug
- title
- status
- transformed content
- authorId
- taxonomyTermIds
- warnings

## Media

Media plan hiện lấy từ `bundle.media` và tạo:

- sourceId
- url
- filename
- mimeType
- altText

Không có upload thật hoặc checksum/dedupe.

## Unresolved items và manual fixes

Một item bị unresolved khi:

- không có transform result
- có warning
- có unsupported nodes

Manual fixes hiện được rút từ:

- shortcode
- unsupported blocks
- warnings mức `warning` hoặc `error`

## Khoảng trống tích hợp

`ImportPlan` hiện chưa phải payload của API EmDash thật.

Để đóng gap này, bước tiếp theo hợp lý là:

1. xác định target contract
2. map `StructuredNode` sang target schema
3. thay planning-only adapter bằng adapter thật
