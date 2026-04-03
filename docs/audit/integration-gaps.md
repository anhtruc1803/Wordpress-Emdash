# Integration Gaps

## Gap giữa MVP hiện tại và EmDash integration thật

Hiện repo dừng ở `ImportPlan`, chưa dừng ở target payload hoặc API call thật.

Khoảng trống chính:

- chưa xác định target schema cụ thể cho EmDash
- chưa map `StructuredNode` sang target model
- chưa upload media thật
- chưa có id reconciliation sau import
- chưa có retry/error handling cho target calls

## Current adapter assumptions

`PlanningOnlyEmDashTargetAdapter` giả định:

- import plan đã là output đủ giá trị cho MVP
- target URL chỉ là metadata
- không có side effects thật

## Pending interfaces

Cần thêm khi bước sang integration:

- entry import contract
- media import/upload contract
- taxonomy/author mapping contract
- target error model

## Thứ tự đóng gap hợp lý

1. khóa target schema tối thiểu
2. tạo mapper từ `ImportPlan` sang target payload
3. thêm adapter import thật
4. thêm integration tests với target giả lập
5. thêm id mapping và retry/recovery logic
