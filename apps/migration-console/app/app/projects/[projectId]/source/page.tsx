"use client";

import { useParams } from "next/navigation";

import { KeyValueList, Panel, SectionHeader } from "@/components/data-display/cards";
import { ErrorState, LoadingState } from "@/components/data-display/states";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { useTestSourceMutation, useWorkspaceQuery } from "@/lib/hooks/queries";
import { translateSourceKind, translateSourceValidationState, translateValidationMessage } from "@/lib/i18n/ui";

export default function ProjectSourcePage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const validateSource = useTestSourceMutation(projectId);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải cấu hình nguồn dữ liệu..." : "Loading source configuration..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được nguồn dữ liệu" : "Unable to load source configuration"}
        description={
          locale === "vi"
            ? "Không thể tải cấu hình nguồn dữ liệu của dự án này."
            : "The source configuration for this project could not be loaded."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Nguồn dữ liệu" : "Source"}
        description={
          locale === "vi"
            ? "Kiểm tra chi tiết kết nối, trạng thái xác thực hiện tại và đầu vào chính xác mà bridge migration sẽ sử dụng."
            : "Inspect the connection details, current validation state, and the exact input that the migration bridge will use."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
      />

      <StickyActionBar>
        <Button onClick={() => void validateSource.mutateAsync()} disabled={validateSource.isPending}>
          {locale === "vi" ? "Kiểm tra lại nguồn dữ liệu" : "Retest source"}
        </Button>
      </StickyActionBar>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Kết nối" : "Connection"}
          title={locale === "vi" ? "Cấu hình nguồn dữ liệu" : "Source configuration"}
          description={
            locale === "vi"
              ? "UI này hiện dùng một bridge cục bộ để đọc cấu hình nguồn đã lưu và gọi migration-core ở phía server."
              : "This UI currently uses a local bridge to read persisted source settings and invoke migration-core on the server."
          }
        />
        <div className="p-5">
          <KeyValueList
            values={[
              { label: locale === "vi" ? "Loại nguồn" : "Source type", value: data.project.source?.kind ? translateSourceKind(data.project.source.kind, locale) : locale === "vi" ? "Chưa cấu hình" : "Not configured" },
              { label: locale === "vi" ? "Nhãn nguồn" : "Source label", value: data.project.source?.label ?? (locale === "vi" ? "Chưa cấu hình" : "Not configured") },
              { label: locale === "vi" ? "Đầu vào" : "Input", value: data.project.source?.input ?? (locale === "vi" ? "Chưa cấu hình" : "Not configured") },
              { label: locale === "vi" ? "Trạng thái xác thực" : "Validation state", value: translateSourceValidationState(data.project.sourceValidation.state, locale) },
              {
                label: locale === "vi" ? "Ghi chú xác thực" : "Validation note",
                value: translateValidationMessage(data.project.sourceValidation.message, locale) ?? (locale === "vi" ? "Chưa có ghi chú xác thực." : "No validation message yet.")
              },
              {
                label: locale === "vi" ? "Thời điểm kiểm tra" : "Checked at",
                value: data.project.sourceValidation.checkedAt ?? (locale === "vi" ? "Chưa kiểm tra" : "Not checked yet")
              }
            ]}
          />
        </div>
      </Panel>
    </div>
  );
}
