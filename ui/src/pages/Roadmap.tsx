import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { projectsApi } from "../api/projects";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { projectUrl } from "../lib/utils";
import { Link } from "@/lib/router";
import { Map } from "lucide-react";
import type { Project } from "@paperclipai/shared";

interface StageInfo {
  label: string;
  short: string;
  phase: "plan" | "dev" | "test" | "launch";
}

const DEV_STAGES: StageInfo[] = [
  { label: "아이디어 구체화", short: "아이디어", phase: "plan" },
  { label: "피그마 화면 시각화", short: "피그마", phase: "plan" },
  { label: "화면별 기능명세", short: "기능명세", phase: "plan" },
  { label: "프런트 개발", short: "프런트", phase: "dev" },
  { label: "백엔드 테이블 설계", short: "DB설계", phase: "dev" },
  { label: "백엔드 구축", short: "백엔드", phase: "dev" },
  { label: "프런트-백엔드 연결", short: "연결", phase: "dev" },
  { label: "기타 컴포넌트 연결", short: "컴포넌트", phase: "dev" },
  { label: "특정 기능 개발", short: "특수기능", phase: "dev" },
  { label: "전체 화면별 QA", short: "화면QA", phase: "test" },
  { label: "로직별 유닛 QA", short: "유닛QA", phase: "test" },
  { label: "UIUX 테스트", short: "UIUX", phase: "test" },
  { label: "배포 준비", short: "배포준비", phase: "launch" },
  { label: "출시", short: "출시", phase: "launch" },
  { label: "데이터 분석", short: "분석", phase: "launch" },
  { label: "수익 극대화", short: "수익운영", phase: "launch" },
];

const PHASE_META: Record<StageInfo["phase"], { label: string; color: string; bg: string; border: string; pastBg: string; pastBorder: string }> = {
  plan: { label: "기획", color: "text-violet-500", bg: "bg-violet-500", border: "border-violet-500", pastBg: "bg-violet-100 dark:bg-violet-900/40", pastBorder: "border-violet-300 dark:border-violet-700" },
  dev: { label: "개발", color: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500", pastBg: "bg-blue-100 dark:bg-blue-900/40", pastBorder: "border-blue-300 dark:border-blue-700" },
  test: { label: "테스트", color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500", pastBg: "bg-amber-100 dark:bg-amber-900/40", pastBorder: "border-amber-300 dark:border-amber-700" },
  launch: { label: "출시/운영", color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500", pastBg: "bg-emerald-100 dark:bg-emerald-900/40", pastBorder: "border-emerald-300 dark:border-emerald-700" },
};

const PHASE_GROUPS = (() => {
  const groups: { phase: StageInfo["phase"]; startIdx: number; count: number }[] = [];
  let currentPhase: StageInfo["phase"] | null = null;
  for (let i = 0; i < DEV_STAGES.length; i++) {
    const s = DEV_STAGES[i]!;
    if (s.phase !== currentPhase) {
      groups.push({ phase: s.phase, startIdx: i, count: 1 });
      currentPhase = s.phase;
    } else {
      groups[groups.length - 1]!.count++;
    }
  }
  return groups;
})();

function StageCell({
  stageIdx,
  currentStage,
  projectId,
  onUpdate,
}: {
  stageIdx: number;
  currentStage: number | null;
  projectId: string;
  onUpdate: (projectId: string, stage: number | null) => void;
}) {
  const isActive = currentStage === stageIdx;
  const isPast = currentStage !== null && stageIdx < currentStage;
  const stage = DEV_STAGES[stageIdx]!;
  const meta = PHASE_META[stage.phase];

  return (
    <button
      title={stage.label}
      onClick={() => onUpdate(projectId, isActive ? null : stageIdx)}
      className={[
        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
        isActive
          ? `${meta.border} ${meta.bg} scale-125 shadow-sm`
          : isPast
            ? `${meta.pastBorder} ${meta.pastBg}`
            : "border-border bg-transparent hover:border-muted-foreground/40",
      ].join(" ")}
    >
      {isActive && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
    </button>
  );
}

export function Roadmap() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs([{ label: "로드맵" }]);
  }, [setBreadcrumbs]);

  const { data: allProjects, isLoading } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const projects = (allProjects ?? []).filter((p) => !p.archivedAt);

  const mutation = useMutation({
    mutationFn: ({ projectId, stage }: { projectId: string; stage: number | null }) =>
      projectsApi.update(projectId, { devStage: stage }, selectedCompanyId ?? undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(
        queryKeys.projects.list(selectedCompanyId!),
        (prev) => prev?.map((p) => (p.id === updated.id ? updated : p)) ?? prev,
      );
    },
  });

  function handleUpdate(projectId: string, stage: number | null) {
    mutation.mutate({ projectId, stage });
  }

  if (!selectedCompanyId) {
    return <EmptyState icon={Map} message="Select a company to view roadmap." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  if (projects.length === 0) {
    return <EmptyState icon={Map} message="No projects yet." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">프로젝트 로드맵</h1>
        <p className="text-sm text-muted-foreground mt-0.5">각 프로젝트의 개발 단계를 추적합니다</p>
      </div>

      {/* Mobile view (cards) */}
      <div className="space-y-3 md:hidden">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onUpdate={handleUpdate} />
        ))}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            {/* Phase group header */}
            <tr className="border-b border-border">
              <th className="w-48 shrink-0 sticky left-0 bg-background z-10" />
              {PHASE_GROUPS.map((g) => {
                const meta = PHASE_META[g.phase];
                return (
                  <th
                    key={g.phase}
                    colSpan={g.count}
                    className="px-1 pt-2 pb-1 text-center border-l border-border first:border-l-0"
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
                      {meta.label}
                    </span>
                  </th>
                );
              })}
            </tr>
            {/* Stage labels */}
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-48 shrink-0 sticky left-0 bg-background z-10">
                프로젝트
              </th>
              {DEV_STAGES.map((stage, idx) => (
                <th
                  key={idx}
                  className="px-1 py-2 font-medium text-muted-foreground text-[10px] whitespace-nowrap min-w-[44px]"
                  title={stage.label}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-muted-foreground/50 font-mono">{idx + 1}</span>
                    <span>{stage.short}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onUpdate={handleUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Phase legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs text-muted-foreground">
        {PHASE_GROUPS.map((g) => {
          const meta = PHASE_META[g.phase];
          const stages = DEV_STAGES.slice(g.startIdx, g.startIdx + g.count);
          return (
            <div key={g.phase} className="space-y-1">
              <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
              <div className="flex flex-col gap-0.5">
                {stages.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] w-4 text-right text-muted-foreground/50">
                      {g.startIdx + i + 1}
                    </span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (projectId: string, stage: number | null) => void;
}) {
  const currentStage = project.devStage ?? null;
  const stage = currentStage !== null ? DEV_STAGES[currentStage] : null;
  const stageLabel = stage?.label ?? null;
  const progress = currentStage !== null ? Math.round(((currentStage + 1) / DEV_STAGES.length) * 100) : 0;
  const phaseMeta = stage ? PHASE_META[stage.phase] : null;

  return (
    <div className="rounded-md border border-border p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-sm shrink-0"
          style={{ backgroundColor: project.color ?? "#6366f1" }}
        />
        <Link
          to={projectUrl(project)}
          className="font-medium text-foreground hover:underline truncate flex-1"
        >
          {project.name}
        </Link>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{progress}%</span>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${phaseMeta?.bg ?? "bg-muted-foreground/30"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          {stageLabel ? (
            <span className={`font-medium ${phaseMeta?.color}`}>
              {currentStage! + 1}. {stageLabel}
            </span>
          ) : (
            <span className="text-muted-foreground/60">미설정</span>
          )}
          <span className="text-muted-foreground/50 font-mono">
            {currentStage !== null ? currentStage + 1 : 0}/{DEV_STAGES.length}
          </span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {DEV_STAGES.map((s, idx) => {
          const isActive = currentStage === idx;
          const isPast = currentStage !== null && idx < currentStage;
          const meta = PHASE_META[s.phase];
          return (
            <button
              key={idx}
              title={`${idx + 1}. ${s.label}`}
              onClick={() => onUpdate(project.id, isActive ? null : idx)}
              className={[
                "h-7 min-w-[28px] px-1.5 rounded text-[10px] font-mono font-semibold border transition-all shrink-0",
                isActive
                  ? `${meta.border} ${meta.bg} text-white shadow-sm`
                  : isPast
                    ? `${meta.pastBorder} ${meta.pastBg} ${meta.color}`
                    : "border-border bg-transparent text-muted-foreground/50",
              ].join(" ")}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (projectId: string, stage: number | null) => void;
}) {
  const currentStage = project.devStage ?? null;
  const stageLabel = currentStage !== null ? DEV_STAGES[currentStage]?.label : null;
  const progress = currentStage !== null ? Math.round(((currentStage + 1) / DEV_STAGES.length) * 100) : 0;
  const phaseMeta = currentStage !== null ? PHASE_META[DEV_STAGES[currentStage]!.phase] : null;

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-accent/30 group">
      <td className="px-3 py-2.5 sticky left-0 bg-background group-hover:bg-accent/30 z-10">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: project.color ?? "#6366f1" }}
          />
          <div className="min-w-0 flex-1">
            <Link
              to={projectUrl(project)}
              className="font-medium text-foreground hover:underline truncate block max-w-[150px]"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              {stageLabel ? (
                <>
                  <span className={`text-[10px] font-medium ${phaseMeta?.color ?? "text-muted-foreground"}`}>
                    {stageLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {progress}%
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground/50">미설정</span>
              )}
            </div>
          </div>
        </div>
      </td>
      {DEV_STAGES.map((_, idx) => (
        <td key={idx} className="px-1 py-2.5 text-center">
          <div className="flex justify-center">
            <StageCell
              stageIdx={idx}
              currentStage={currentStage}
              projectId={project.id}
              onUpdate={onUpdate}
            />
          </div>
        </td>
      ))}
    </tr>
  );
}
