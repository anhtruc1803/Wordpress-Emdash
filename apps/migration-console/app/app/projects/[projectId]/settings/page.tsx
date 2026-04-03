"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { KeyValueList, Panel, SectionHeader } from "@/components/data-display/cards";
import { ErrorState, LoadingState } from "@/components/data-display/states";
import { Button } from "@/components/layout/button";
import { Input } from "@/components/layout/form-controls";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  useTestTargetMutation,
  useUpdateProjectMutation,
  useWorkspaceQuery
} from "@/lib/hooks/queries";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const updateProject = useUpdateProjectMutation(projectId);
  const testTarget = useTestTargetMutation(projectId);
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [apiToken, setApiToken] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    setName(data.project.name);
    setTargetUrl(data.project.target?.baseUrl ?? "");
  }, [data]);

  if (isLoading) {
    return <LoadingState label={locale === "vi" ? "Đang tải thiết lập..." : "Loading settings..."} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được thiết lập" : "Unable to load settings"}
        description={
          locale === "vi"
            ? "Workspace thiết lập hiện không thể mở."
            : "The settings workspace is currently unavailable."
        }
      />
    );
  }

  async function handleSave() {
    await updateProject.mutateAsync({
      name,
      target: {
        baseUrl: targetUrl,
        apiToken: apiToken || undefined
      }
    });
    setApiToken("");
  }

  async function handleTestConnection() {
    await testTarget.mutateAsync();
  }

  const targetValidation = data.project.targetValidation;
  const validationMessage = translateTargetValidationMessage(
    targetValidation.message,
    locale
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Thiết lập" : "Settings"}
        description={
          locale === "vi"
            ? "Cấu hình metadata dự án và thông tin kết nối EmDash dùng cho import thật."
            : "Configure project metadata and the EmDash target used for live import."
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
              ? "Lưu URL EmDash và API token tại đây. Có thể để trống ô token nếu muốn giữ token hiện đang lưu trên server."
              : "Save the EmDash URL and API token here. Leave the token blank to keep the token already stored on the server."
          }
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => void handleTestConnection()}
                disabled={
                  testTarget.isPending ||
                  !data.project.target?.baseUrl ||
                  !data.project.target?.apiTokenConfigured
                }
              >
                {testTarget.isPending
                  ? locale === "vi"
                    ? "Đang kiểm tra..."
                    : "Testing..."
                  : locale === "vi"
                    ? "Kiểm tra kết nối EmDash"
                    : "Test EmDash connection"}
              </Button>
              <Button onClick={() => void handleSave()} disabled={updateProject.isPending}>
                {updateProject.isPending
                  ? locale === "vi"
                    ? "Đang lưu..."
                    : "Saving..."
                  : locale === "vi"
                    ? "Lưu thiết lập"
                    : "Save settings"}
              </Button>
            </div>
          }
        />
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{locale === "vi" ? "Tên dự án" : "Project name"}</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{locale === "vi" ? "URL site EmDash" : "EmDash site URL"}</span>
            <Input
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://your-site.example"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
            <span>{locale === "vi" ? "API token EmDash" : "EmDash API token"}</span>
            <Input
              type="password"
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder={
                data.project.target?.apiTokenConfigured
                  ? locale === "vi"
                    ? "Token đã lưu. Nhập token mới nếu muốn thay thế."
                    : "A token is already stored. Enter a new one to replace it."
                  : "ec_pat_..."
              }
            />
            <p className="text-xs text-muted">
              {data.project.target?.apiTokenConfigured
                ? locale === "vi"
                  ? "Token hiện có đang được giữ ở server-side secret store."
                  : "The current token is kept in the server-side secret store."
                : locale === "vi"
                  ? "Cần token có quyền schema, taxonomies, media, content và admin để import thật."
                  : "A token with schema, taxonomies, media, content, and admin scopes is required for live import."}
            </p>
          </label>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Trạng thái target" : "Target status"}
          title={locale === "vi" ? "Kết nối EmDash hiện tại" : "Current EmDash target"}
          description={
            locale === "vi"
              ? "Console dùng base path /_emdash/api theo contract đã xác minh từ mã nguồn EmDash."
              : "The console uses the /_emdash/api base path based on the verified EmDash source contract."
          }
        />
        <div className="p-5">
          <KeyValueList
            values={[
              {
                label: locale === "vi" ? "URL target" : "Target URL",
                value:
                  data.project.target?.baseUrl ??
                  (locale === "vi" ? "Chưa cấu hình" : "Not configured")
              },
              {
                label: locale === "vi" ? "API base path" : "API base path",
                value: data.project.target?.apiBasePath ?? "/_emdash/api"
              },
              {
                label: locale === "vi" ? "API token" : "API token",
                value:
                  data.project.target?.apiTokenConfigured
                    ? locale === "vi"
                      ? "Đã cấu hình"
                      : "Configured"
                    : locale === "vi"
                      ? "Chưa cấu hình"
                      : "Not configured"
              },
              {
                label: locale === "vi" ? "Kết quả kiểm tra" : "Connection test",
                value:
                  targetValidation.state === "valid"
                    ? locale === "vi"
                      ? "Kết nối hợp lệ"
                      : "Connection valid"
                    : targetValidation.state === "invalid"
                      ? locale === "vi"
                        ? "Kết nối thất bại"
                        : "Connection failed"
                      : locale === "vi"
                        ? "Chưa kiểm tra"
                        : "Not checked"
              },
              {
                label: locale === "vi" ? "Lần kiểm tra gần nhất" : "Last checked",
                value:
                  targetValidation.checkedAt
                    ? formatDate(targetValidation.checkedAt, locale)
                    : locale === "vi"
                      ? "Chưa kiểm tra"
                      : "Not checked"
              },
              {
                label: locale === "vi" ? "Ghi chú kiểm tra" : "Validation note",
                value:
                  validationMessage ??
                  (locale === "vi" ? "Chưa có ghi chú kiểm tra" : "No validation note yet")
              }
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Bridge behavior hiện tại" : "Current bridge behavior"}
          title={locale === "vi" ? "Chi tiết implementation" : "Implementation details"}
          description={
            locale === "vi"
              ? "Bản import hiện ưu tiên an toàn: tạo collection và field import-safe, sync taxonomy/terms, upload media, rồi tạo entry với Portable Text cho các block hỗ trợ tốt."
              : "The current import prioritizes safety: create import-safe collections and fields, sync taxonomies/terms, upload media, then create entries with Portable Text for well-supported blocks."
          }
        />
        <div className="p-5">
          <KeyValueList
            values={[
              {
                label: locale === "vi" ? "Content field" : "Content field",
                value:
                  locale === "vi"
                    ? "migration_content (Portable Text, có fallback sang JSON field nếu schema cũ không nhận portableText)"
                    : "migration_content (Portable Text, with JSON field fallback if an older schema rejects portableText)"
              },
              {
                label: locale === "vi" ? "Metadata field" : "Metadata field",
                value: "migration_meta"
              },
              {
                label: locale === "vi" ? "Taxonomy flow" : "Taxonomy flow",
                value:
                  locale === "vi"
                    ? "Tạo taxonomy definition và term thật qua /taxonomies và /taxonomies/:name/terms"
                    : "Create real taxonomy definitions and terms through /taxonomies and /taxonomies/:name/terms"
              },
              {
                label: locale === "vi" ? "Media flow" : "Media flow",
                value: "upload-url -> PUT file -> confirm"
              },
              {
                label: locale === "vi" ? "Mục rủi ro cao" : "High-risk items",
                value:
                  locale === "vi"
                    ? "Các mục có unresolved severity=error sẽ bị bỏ qua khi import"
                    : "Items with unresolved severity=error are skipped during import"
              }
            ]}
          />
        </div>
      </Panel>
    </div>
  );
}

function translateTargetValidationMessage(
  message: string | undefined,
  locale: "vi" | "en"
): string | undefined {
  if (!message || locale === "en") {
    return message;
  }

  if (message.startsWith("Connected to ")) {
    return message
      .replace("Connected to ", "Đã kết nối tới ")
      .replace(
        " and verified schema/taxonomy access.",
        " và đã xác minh được quyền schema/taxonomy."
      );
  }

  if (message.startsWith("Connection test reached ")) {
    return message
      .replace("Connection test reached ", "Đã kết nối tới ")
      .replace(
        ", but one or more API checks failed.",
        " nhưng một hoặc nhiều bước kiểm tra API đã thất bại."
      );
  }

  if (message === "Configure an EmDash target URL before testing the connection.") {
    return "Hãy cấu hình URL EmDash trước khi kiểm tra kết nối.";
  }

  if (message === "Configure an EmDash API token before testing the connection.") {
    return "Hãy cấu hình API token EmDash trước khi kiểm tra kết nối.";
  }

  return message;
}
