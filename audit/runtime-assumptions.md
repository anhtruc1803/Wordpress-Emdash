# Runtime Assumptions

## General assumptions

- Node.js hiện đại có `fetch`
- filesystem cục bộ ghi được vào output directory
- source REST API công khai hoặc ít nhất có thể fetch không auth

## WXR assumptions

- file XML có `rss.channel`
- data fields chính nằm ở namespaces WordPress quen thuộc
- attachment metadata tối thiểu có thể được đọc từ postmeta đơn giản

## REST assumptions

- endpoint chuẩn `wp-json`
- resources chính ở `wp/v2/*`
- pagination theo header `x-wp-totalpages`
- custom post types viewable và có `rest_base`

## Artifact assumptions

- output directory tồn tại hoặc tạo được
- artifact đủ nhỏ để ghi bộ nhớ/đĩa theo cách hiện tại

## Target assumptions

- target URL trong command `import` hiện chỉ là metadata cho planning
- không có import side effect thực
