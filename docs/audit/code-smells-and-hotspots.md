# Code Smells And Hotspots

## `shared-types/src/index.ts`

Hotspot vì:

- là single contract hub
- thay đổi nhỏ có blast radius lớn

Khuyến nghị:

- giữ discipline rõ khi thêm field
- cân nhắc tách theo domain nếu model phình to

## `connectors/rest.ts`

Smell:

- vừa fetch, vừa paginate, vừa validate, vừa normalize

Hiện chưa quá lớn, nhưng dễ thành “god connector” khi thêm auth/retry/caching/custom endpoints.

## `block-transformers.ts`

Hotspot:

- mọi block rule dồn vào một switch

Khuyến nghị:

- khi coverage tăng đáng kể, chuyển sang registry theo block name

## `audit-source.ts`

Hotspot:

- gom nhiều logic tín hiệu vào một module
- inventory, issue creation, hint aggregation và scoring prep đi cùng nhau

Khuyến nghị:

- tách detector modules khi số rule tăng

## `create-import-plan.ts`

Hotspot:

- đang gánh mapping collection, unresolved logic, manual fix derivation, media plan và rewrite suggestion

Khuyến nghị:

- tách từng concern nếu target integration trở nên thực hơn

## Smell nhẹ nhưng đáng chú ý

- report strings hiện hard-code trong renderer
- chưa có error classes riêng
- chưa có artifact version metadata
