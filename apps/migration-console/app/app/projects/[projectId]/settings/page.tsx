"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { ErrorState, LoadingState } from "@/components/data-display/states";
import { KeyValueList, Panel, SectionHeader } from "@/components/data-display/cards";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/form-controls";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { useUpdateProjectMutation, useWorkspaceQuery } from "@/lib/hooks/queries";

export default function SettingsPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const updateProject = useUpdateProjectMutation(projectId);
  const [name, setName] = useState("");

  useEffect(() => {
    if (data?.project.name) {
      setName(data.project.name);
    }
  }, [data?.project.name]);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải thiết lập..." : "Loading settings..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được thiết lập" : "Unable to load settings"}
        description={locale === "vi" ? "Workspace thiết lập hiện không thể mở." : "The settings workspace is currently unavailable."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Thiết lập" : "Settings"}
        description={
          locale === "vi"
            ? "Bạn có thể chỉnh metadata dự án tại đây. Các mục parse và output hiện phản ánh bridge behavior và sẽ để ở chế độ chỉ đọc nếu backend chưa hỗ trợ cấu hình."
            : "Project metadata can be edited here. Parse and output sections reflect current bridge behavior and remain read-only until the backend supports configuration."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Metadata dự án" : "Project metadata"}
          title={locale === "vi" ? "Thiết lập có thể chỉnh sửa" : "Editable settings"}
          description={
            locale === "vi"
              ? "Các thiết lập trong UI hiện được giữ ở mức bảo thủ: chỉ những trường đã có local bridge hỗ trợ mới được sửa."
              : "The UI remains conservative for now: only fields already supported by the local bridge can be edited."
          }
          actions={
            <Button onClick={() => void updateProject.mutateAsync({ name })} disabled={updateProject.isPending}>
              {locale === "vi" ? "Lưu dự án" : "Save project"}
            </Button>
          }
        />
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{locale === "vi" ? "Tên dự án" : "Project name"}</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Bridge behavior hiện tại" : "Current bridge behavior"}
          title={locale === "vi" ? "Chi tiết implementation chỉ đọc" : "Read-only implementation details"}
          description={
            locale === "vi"
              ? "Các giá trị này mô tả cách UI bridge đang hoạt động ở thời điểm hiện tại. Chúng chưa thể cấu hình bởi người dùng."
              : "These values describe how the UI bridge works today. They are not user-configurable yet."
          }
        />
        <div className="p-5">
          <KeyValueList
            values={[
              {
                label: locale === "vi" ? "Thực thi nguồn dữ liệu" : "Source execution",
                value: locale === "vi" ? "migration-core connectors được gọi ở phía server" : "migration-core connectors are invoked on the server"
              },
              {
                label: locale === "vi" ? "Chế độ audit" : "Audit mode",
                value: locale === "vi" ? "Dùng mặc định audit hiện tại của migration-core" : "Uses the current default audit behavior from migration-core"
              },
              {
                label: locale === "vi" ? "Chế độ transform" : "Transform mode",
                value: locale === "vi" ? "Dùng mặc định transform hiện tại của migration-core" : "Uses the current default transform behavior from migration-core"
              },
              {
                label: locale === "vi" ? "Chiến lược đầu ra" : "Output strategy",
                value: locale === "vi" ? "Thư mục artifact theo từng lần chạy dưới .console-data/projects" : "Per-run artifact directories under .console-data/projects"
              },
              {
                label: locale === "vi" ? "Chế độ import" : "Import mode",
                value: locale === "vi" ? "Planning-only adapter, chưa có live EmDash mutation" : "Planning-only adapter, no live EmDash mutation yet"
              },
              {
                label: locale === "vi" ? "Lưu thiết lập" : "Settings persistence",
                value: locale === "vi" ? "Metadata dự án được lưu trong file manifest JSON cục bộ" : "Project metadata is stored in a local JSON manifest"
              }
            ]}
          />
        </div>
      </Panel>
    </div>
  );
}
