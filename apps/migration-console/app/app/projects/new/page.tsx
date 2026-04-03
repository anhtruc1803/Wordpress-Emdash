"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Panel, SectionHeader } from "@/components/data-display/cards";
import { Button } from "@/components/layout/button";
import { Input, Select } from "@/components/layout/form-controls";
import { useLocale } from "@/components/layout/locale-provider";
import { PageHeader } from "@/components/layout/page-header";
import { useCreateProjectMutation } from "@/lib/hooks/queries";

export default function NewProjectPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const createProject = useCreateProjectMutation();
  const [name, setName] = useState("");
  const [sourceKind, setSourceKind] = useState<"wxr" | "api">("wxr");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(locale === "vi" ? "Bạn cần nhập tên dự án." : "Project name is required.");
      return;
    }

    if (sourceKind === "api" && !sourceUrl.trim()) {
      setError(locale === "vi" ? "Bạn cần nhập URL WordPress REST API." : "A WordPress REST API URL is required.");
      return;
    }

    if (sourceKind === "wxr" && !file) {
      setError(locale === "vi" ? "Hãy tải tệp WXR lên trước khi tạo dự án." : "Upload a WXR file before creating the project.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("sourceKind", sourceKind);

    if (sourceKind === "api") {
      formData.set("sourceUrl", sourceUrl);
    }

    if (file) {
      formData.set("file", file);
    }

    const project = await createProject.mutateAsync(formData);
    router.push(`/app/projects/${project.id}/overview`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === "vi" ? "Tạo dự án migration" : "Create migration project"}
        description={
          locale === "vi"
            ? "Bắt đầu một workspace mới bằng cách đặt tên cho migration và kết nối tệp WXR hoặc nguồn WordPress REST đang chạy."
            : "Start a new workspace by naming the migration and connecting either a WXR file or a live WordPress REST source."
        }
        backHref="/app/projects"
      />

      <Panel className="max-w-3xl">
        <SectionHeader
          eyebrow={locale === "vi" ? "Thiết lập dự án" : "Project setup"}
          title={locale === "vi" ? "Cấu hình nguồn dữ liệu" : "Configure the source"}
          description={
            locale === "vi"
              ? "Console này lưu metadata dự án cục bộ và dùng core migration pipeline làm lớp bridge để thực thi."
              : "The console stores project metadata locally and uses the migration core pipeline as the execution bridge."
          }
        />
        <form className="space-y-5 p-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{locale === "vi" ? "Tên dự án" : "Project name"}</span>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={locale === "vi" ? "Migration nội dung Acme" : "Acme content migration"} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{locale === "vi" ? "Loại nguồn dữ liệu" : "Source type"}</span>
              <Select value={sourceKind} onChange={(event) => setSourceKind(event.target.value as "wxr" | "api")}>
                <option value="wxr">{locale === "vi" ? "Tải tệp WXR lên" : "Upload WXR file"}</option>
                <option value="api">WordPress REST API</option>
              </Select>
            </label>
          </div>

          {sourceKind === "api" ? (
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{locale === "vi" ? "URL WordPress REST API" : "WordPress REST API URL"}</span>
              <Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.com/wp-json" />
            </label>
          ) : (
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{locale === "vi" ? "Tải tệp WXR" : "Upload WXR file"}</span>
              <Input type="file" accept=".xml" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </label>
          )}

          <div className="rounded-2xl border border-line bg-panel-strong p-4 text-sm leading-6 text-muted">
            {locale === "vi"
              ? "Sau khi tạo, bạn sẽ dùng workspace dự án để xác thực nguồn dữ liệu, chạy audit, xem rủi ro, chạy thử dry run và rà soát danh sách chỉnh sửa thủ công."
              : "After creation, the project workspace is where you validate the source, run audits, inspect risk, execute dry runs, and review manual fixes."}
          </div>

          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? (locale === "vi" ? "Đang tạo dự án..." : "Creating project...") : locale === "vi" ? "Tạo dự án" : "Create project"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/app/projects")}>
              {locale === "vi" ? "Hủy" : "Cancel"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
