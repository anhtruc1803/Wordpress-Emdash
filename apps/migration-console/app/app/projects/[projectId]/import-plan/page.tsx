"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";

import { KeyValueList, Panel, SectionHeader } from "@/components/data-display/cards";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-display/states";
import { ImportPlanSummary } from "@/components/domain/import-plan-summary";
import { Button } from "@/components/layout/button";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { useRunImportMutation, useWorkspaceQuery } from "@/lib/hooks/queries";
import { formatDate } from "@/lib/utils";
import type {
  ImportEntryPlan,
  ImportFailure,
  ImportedEntryRecord,
  ImportedTaxonomyRecord,
  ImportedTermRecord,
  MediaImportPlan
} from "@wp2emdash/shared-types";

const entryHelper = createColumnHelper<ImportEntryPlan>();
const mediaHelper = createColumnHelper<MediaImportPlan>();
const importedEntryHelper = createColumnHelper<ImportedEntryRecord>();
const taxonomyHelper = createColumnHelper<ImportedTaxonomyRecord>();
const termHelper = createColumnHelper<ImportedTermRecord>();

export default function ImportPlanPage() {
  const { locale } = useLocale();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, isLoading, isError } = useWorkspaceQuery(projectId);
  const importAction = useRunImportMutation(projectId);

  if (isLoading) {
    return (
      <LoadingState
        label={locale === "vi" ? "Đang tải kế hoạch import..." : "Loading import plan..."}
      />
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={locale === "vi" ? "Không tải được kế hoạch import" : "Unable to load import plan"}
        description={
          locale === "vi"
            ? "Kế hoạch import của dự án này hiện không thể mở."
            : "The import plan for this project is currently unavailable."
        }
      />
    );
  }

  if (!data.snapshot.importPlan) {
    return (
      <EmptyState
        title={locale === "vi" ? "Chưa tạo kế hoạch import" : "No import plan yet"}
        description={
          locale === "vi"
            ? "Hãy chạy dry run trước khi rà soát collection, bản ghi, media import hoặc mapping chưa xử lý."
            : "Run a dry run before reviewing collections, entries, media imports, or unresolved mappings."
        }
      />
    );
  }

  const plan = data.snapshot.importPlan;
  const importResult = data.snapshot.importResult;
  const targetConfigured = Boolean(data.project.target?.baseUrl);
  const tokenConfigured = Boolean(data.project.target?.apiTokenConfigured);
  const targetValidated = data.project.targetValidation.state === "valid";

  const entryColumns = [
    entryHelper.accessor("title", {
      header: locale === "vi" ? "Bản ghi" : "Entry",
      cell: (info) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{info.getValue()}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {info.row.original.sourceType} {locale === "vi" ? "sang" : "to"}{" "}
            {info.row.original.targetCollection}
          </p>
        </div>
      )
    }),
    entryHelper.accessor("slug", { header: "Slug" }),
    entryHelper.accessor("status", {
      header: locale === "vi" ? "Trạng thái" : "Status"
    }),
    entryHelper.accessor((row) => row.warnings.length, {
      id: "warnings",
      header: locale === "vi" ? "Cảnh báo" : "Warnings",
      cell: (info) => <span>{info.getValue()}</span>
    })
  ];

  const mediaColumns = [
    mediaHelper.accessor("filename", {
      header: locale === "vi" ? "Tài sản" : "Asset"
    }),
    mediaHelper.accessor("mimeType", {
      header: locale === "vi" ? "Loại" : "Type",
      cell: (info) => (
        <span>{info.getValue() ?? (locale === "vi" ? "Không rõ" : "Unknown")}</span>
      )
    }),
    mediaHelper.accessor("url", {
      header: locale === "vi" ? "URL nguồn" : "Source URL",
      cell: (info) => (
        <span className="break-all text-xs text-slate-700">{info.getValue()}</span>
      )
    })
  ];

  const importedEntryColumns = [
    importedEntryHelper.accessor("sourceId", {
      header: locale === "vi" ? "Nguồn" : "Source"
    }),
    importedEntryHelper.accessor("collection", {
      header: "Collection"
    }),
    importedEntryHelper.accessor("slug", {
      header: "Slug"
    }),
    importedEntryHelper.accessor("status", {
      header: locale === "vi" ? "Kết quả" : "Result"
    }),
    importedEntryHelper.accessor("reason", {
      header: locale === "vi" ? "Ghi chú" : "Note",
      cell: (info) => (
        <span className="text-xs text-slate-700">
          {info.getValue() ?? (locale === "vi" ? "Đã import" : "Imported")}
        </span>
      )
    })
  ];

  const taxonomyColumns = [
    taxonomyHelper.accessor("taxonomy", {
      header: locale === "vi" ? "Taxonomy" : "Taxonomy"
    }),
    taxonomyHelper.accessor("created", {
      header: locale === "vi" ? "Trạng thái" : "Status",
      cell: (info) =>
        info.getValue()
          ? locale === "vi"
            ? "Đã tạo"
            : "Created"
          : locale === "vi"
            ? "Đã tồn tại"
            : "Existing"
    }),
    taxonomyHelper.accessor("collections", {
      header: locale === "vi" ? "Collections áp dụng" : "Collections",
      cell: (info) => (
        <span className="text-xs text-slate-700">{info.getValue().join(", ") || "-"}</span>
      )
    })
  ];

  const termColumns = [
    termHelper.accessor("taxonomy", {
      header: locale === "vi" ? "Taxonomy" : "Taxonomy"
    }),
    termHelper.accessor("slug", {
      header: "Slug"
    }),
    termHelper.accessor("termId", {
      header: locale === "vi" ? "EmDash term id" : "EmDash term id",
      cell: (info) => <span className="text-xs text-slate-700">{info.getValue() ?? "-"}</span>
    }),
    termHelper.accessor("created", {
      header: locale === "vi" ? "Trạng thái" : "Status",
      cell: (info) =>
        info.getValue()
          ? locale === "vi"
            ? "Đã tạo"
            : "Created"
          : locale === "vi"
            ? "Đã tồn tại"
            : "Existing"
    })
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Kế hoạch import" : "Import plan"}
        description={
          locale === "vi"
            ? "Rà soát những gì dry run hiện tại sẽ tạo, tải lên và còn để lại ở trạng thái chưa xử lý."
            : "Review what the current dry run would create, upload, and leave unresolved."
        }
        status={data.project.status}
        recommendation={data.project.recommendation}
        actions={
          <>
            <Link href={`/app/projects/${projectId}/settings`}>
              <Button variant="secondary">
                {locale === "vi" ? "Cấu hình target" : "Configure target"}
              </Button>
            </Link>
            <Button
              onClick={() => void importAction.mutateAsync()}
              disabled={importAction.isPending || !targetConfigured || !tokenConfigured}
            >
              {importAction.isPending
                ? locale === "vi"
                  ? "Đang import..."
                  : "Importing..."
                : locale === "vi"
                  ? "Import sang EmDash"
                  : "Import to EmDash"}
            </Button>
          </>
        }
      />

      <ImportPlanSummary plan={plan} />

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Target EmDash" : "EmDash target"}
          title={locale === "vi" ? "Trạng thái import thật" : "Live import readiness"}
          description={
            locale === "vi"
              ? "Khi đã có URL site và API token, màn này dùng /_emdash/api để tạo collection, field, taxonomy, term, media và entry thật."
              : "Once the site URL and API token are configured, this screen uses /_emdash/api to create real collections, fields, taxonomies, terms, media, and entries."
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
                label: locale === "vi" ? "API token" : "API token",
                value:
                  tokenConfigured
                    ? locale === "vi"
                      ? "Đã cấu hình"
                      : "Configured"
                    : locale === "vi"
                      ? "Chưa cấu hình"
                      : "Not configured"
              },
              {
                label: locale === "vi" ? "Kiểm tra kết nối" : "Connection test",
                value:
                  data.project.targetValidation.state === "valid"
                    ? locale === "vi"
                      ? "Hợp lệ"
                      : "Valid"
                    : data.project.targetValidation.state === "invalid"
                      ? locale === "vi"
                        ? "Thất bại"
                        : "Failed"
                      : locale === "vi"
                        ? "Chưa kiểm tra"
                        : "Not checked"
              },
              {
                label: locale === "vi" ? "Lần import gần nhất" : "Latest import",
                value:
                  (data.project.latestImportAt
                    ? formatDate(data.project.latestImportAt, locale)
                    : undefined) ?? (locale === "vi" ? "Chưa chạy" : "Not run")
              },
              {
                label: locale === "vi" ? "Ghi chú target" : "Target note",
                value:
                  data.project.targetValidation.message ??
                  importResult?.note ??
                  data.snapshot.adapterNote ??
                  (locale === "vi"
                    ? "Chưa có kết quả import"
                    : "No import result yet")
              }
            ]}
          />
          {!targetConfigured || !tokenConfigured ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {locale === "vi"
                ? "Bạn cần lưu URL site EmDash và API token trong phần Thiết lập trước khi có thể chạy import thật."
                : "Save the EmDash site URL and API token in Settings before running a live import."}
            </div>
          ) : null}
          {targetConfigured && tokenConfigured && !targetValidated ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {locale === "vi"
                ? "Nên chạy “Kiểm tra kết nối EmDash” trong phần Thiết lập trước khi import thật để xác minh quyền schema và taxonomy."
                : "Run “Test EmDash connection” in Settings before a live import to verify schema and taxonomy access."}
            </div>
          ) : null}
        </div>
      </Panel>

      {importResult ? (
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Kết quả import" : "Import result"}
            title={locale === "vi" ? "Phiên import gần nhất" : "Latest import execution"}
            description={importResult.note}
          />
          <div className="grid gap-4 p-5 lg:grid-cols-5">
            <MetricCard
              label={locale === "vi" ? "Collection mới" : "New collections"}
              value={importResult.collections.filter((item) => item.created).length}
            />
            <MetricCard
              label={locale === "vi" ? "Field mới" : "New fields"}
              value={importResult.fields.filter((item) => item.created).length}
            />
            <MetricCard
              label={locale === "vi" ? "Taxonomy sync" : "Taxonomies synced"}
              value={importResult.taxonomies.length}
            />
            <MetricCard
              label={locale === "vi" ? "Term sync" : "Terms synced"}
              value={importResult.terms.length}
            />
            <MetricCard
              label={locale === "vi" ? "Entry đã nhập" : "Imported entries"}
              value={importResult.entries.filter((item) => item.status === "imported").length}
            />
          </div>
        </Panel>
      ) : null}

      {importResult ? (
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Taxonomy sync" : "Taxonomy sync"}
            title={locale === "vi" ? "Định nghĩa taxonomy đã xử lý" : "Processed taxonomy definitions"}
            description={
              locale === "vi"
                ? "Bảng này cho biết taxonomy nào đã được tạo mới và taxonomy nào đã có sẵn trên EmDash."
                : "This table shows which taxonomies were created and which already existed on EmDash."
            }
          />
          <div className="p-5">
            {importResult.taxonomies.length ? (
              <DataTable
                data={importResult.taxonomies}
                columns={taxonomyColumns}
                searchPlaceholder={
                  locale === "vi"
                    ? "Tìm theo taxonomy hoặc collection"
                    : "Search by taxonomy or collection"
                }
                searchValueResolver={(row) =>
                  `${row.taxonomy} ${row.collections.join(" ")}`
                }
              />
            ) : (
              <EmptyState
                title={locale === "vi" ? "Không có taxonomy để sync" : "No taxonomy sync result"}
                description={
                  locale === "vi"
                    ? "Nguồn hiện tại không phát sinh taxonomy nào cần tạo trên EmDash."
                    : "The current source did not produce any taxonomies to sync into EmDash."
                }
              />
            )}
          </div>
        </Panel>
      ) : null}

      {importResult ? (
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Term sync" : "Term sync"}
            title={locale === "vi" ? "Terms đã xử lý" : "Processed terms"}
            description={
              locale === "vi"
                ? "Mỗi dòng cho biết term nào đã được tạo hoặc tái sử dụng, và EmDash term id tương ứng."
                : "Each row shows whether a term was created or reused, along with the matching EmDash term id."
            }
          />
          <div className="p-5">
            {importResult.terms.length ? (
              <DataTable
                data={importResult.terms}
                columns={termColumns}
                searchPlaceholder={
                  locale === "vi" ? "Tìm theo taxonomy, slug hoặc term id" : "Search by taxonomy, slug, or term id"
                }
                searchValueResolver={(row) =>
                  `${row.taxonomy} ${row.slug} ${row.termId ?? ""}`
                }
              />
            ) : (
              <EmptyState
                title={locale === "vi" ? "Không có term để sync" : "No term sync result"}
                description={
                  locale === "vi"
                    ? "Chưa có term nào được tạo hoặc tái sử dụng trong lần import này."
                    : "No terms were created or reused during this import run."
                }
              />
            )}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {locale === "vi"
                ? "Lưu ý: lần import hiện tại đã sync taxonomy và term thật, nhưng việc gắn term trực tiếp vào content item vẫn đang chờ contract public rõ ràng từ EmDash API. Tool hiện lưu `emdashTermId` vào metadata để không mất mapping."
                : "Note: the current import syncs real taxonomies and terms, but attaching those terms directly to content items is still waiting on a verified public EmDash API contract. The tool stores `emdashTermId` in metadata so the mapping is preserved."}
            </div>
          </div>
        </Panel>
      ) : null}

      {importResult ? (
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Entry result" : "Entry result"}
            title={locale === "vi" ? "Bản ghi đã xử lý" : "Processed entries"}
            description={
              locale === "vi"
                ? "Danh sách này cho biết bản ghi nào đã được import và bản ghi nào bị bỏ qua do rủi ro."
                : "This list shows which entries were imported and which were skipped because of risk."
            }
          />
          <div className="p-5">
            <DataTable
              data={importResult.entries}
              columns={importedEntryColumns}
              searchPlaceholder={
                locale === "vi"
                  ? "Tìm theo source id, collection hoặc slug"
                  : "Search by source id, collection, or slug"
              }
              searchValueResolver={(row) =>
                `${row.sourceId} ${row.collection} ${row.slug} ${row.reason ?? ""}`
              }
            />
          </div>
        </Panel>
      ) : null}

      {importResult?.failures.length ? (
        <Panel>
          <SectionHeader
            eyebrow={locale === "vi" ? "Lỗi import" : "Import failures"}
            title={locale === "vi" ? "Các lỗi cần xử lý tiếp" : "Follow-up failures"}
            description={
              locale === "vi"
                ? "Những lỗi này không chặn việc xem kết quả tổng thể, nhưng cần xử lý trước khi import lại."
                : "These failures do not block the overall review, but they should be resolved before rerunning import."
            }
          />
          <div className="space-y-3 p-5">
            {importResult.failures.map((failure: ImportFailure, index) => (
              <div
                key={`${failure.stage}-${failure.sourceId ?? "global"}-${index}`}
                className="rounded-2xl border border-rose-200 bg-rose-50 p-4"
              >
                <p className="text-sm font-semibold text-rose-900">
                  {failure.stage}
                  {failure.collection ? ` • ${failure.collection}` : ""}
                  {failure.sourceId ? ` • ${failure.sourceId}` : ""}
                </p>
                <p className="mt-1 text-sm text-rose-800">{failure.message}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Bản ghi" : "Entries"}
          title={locale === "vi" ? "Bản ghi sẽ được import" : "Entries to import"}
          description={
            locale === "vi"
              ? "Các dòng này đến trực tiếp từ kế hoạch do bridge layer tạo ra."
              : "These rows come directly from the plan generated by the bridge layer."
          }
        />
        <div className="p-5">
          <DataTable
            data={plan.entriesToCreate}
            columns={entryColumns}
            searchPlaceholder={
              locale === "vi"
                ? "Tìm theo tiêu đề, slug hoặc collection đích"
                : "Search by title, slug, or target collection"
            }
            searchValueResolver={(row) => `${row.title} ${row.slug} ${row.targetCollection}`}
          />
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          eyebrow={locale === "vi" ? "Tài sản" : "Assets"}
          title={locale === "vi" ? "Media sẽ được import" : "Media to import"}
          description={
            locale === "vi"
              ? "Các tài sản nguồn đã được nhận diện để upload qua signed URL của EmDash."
              : "Source assets identified for upload through EmDash signed URLs."
          }
        />
        <div className="p-5">
          <DataTable
            data={plan.mediaToImport}
            columns={mediaColumns}
            searchPlaceholder={
              locale === "vi" ? "Tìm theo tên file hoặc URL" : "Search by filename or URL"
            }
            searchValueResolver={(row) => `${row.filename} ${row.url}`}
          />
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel-strong p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
