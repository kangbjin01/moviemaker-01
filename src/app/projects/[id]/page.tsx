"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Plus,
  FileText,
  FileDown,
  Calendar,
  Settings,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import type { Project, DailyCallSheet, ProjectStatus } from "~/types/call-sheet";
import { downloadCallSheetPDF } from "~/components/call-sheet/CallSheetPDF";
import { toast } from "sonner";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PREP: "준비중",
  SHOOTING: "촬영중",
  POST: "후반작업",
  COMPLETED: "완료",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PREP: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  SHOOTING: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        toast.error("프로젝트를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      toast.error("프로젝트를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleDeleteCallSheet = async (callSheetId: string) => {
    try {
      const response = await fetch(`/api/call-sheet/${callSheetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            callSheets: prev.callSheets?.filter((cs) => cs.id !== callSheetId),
          };
        });
        toast.success("일촬표가 삭제되었습니다");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("삭제에 실패했습니다");
    }
  };

  const handleDownloadPDF = async (callSheetId: string) => {
    if (!project) return;
    
    try {
      toast.loading("PDF 생성 중...", { id: "pdf-generating" });
      
      const response = await fetch(`/api/call-sheet/${callSheetId}`);
      if (!response.ok) {
        throw new Error("데이터를 불러오는데 실패했습니다");
      }
      const callSheet = await response.json();
      
      await downloadCallSheetPDF(callSheet, project);
      toast.success("PDF가 다운로드되었습니다", { id: "pdf-generating" });
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast.error("PDF 생성에 실패했습니다", { id: "pdf-generating" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
          <Link href="/projects">
            <Button variant="outline">프로젝트 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            프로젝트 목록
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[project.status as ProjectStatus]}
                >
                  {STATUS_LABELS[project.status as ProjectStatus]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {project.type && `${project.type}`}
                {project.director && ` · ${project.director} 감독`}
                {project.productionCo && ` · ${project.productionCo}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/projects/${projectId}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  설정
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/call-sheet/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  새 일촬표
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 일촬표 목록 */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">일일촬영계획표</h2>
          <p className="text-sm text-muted-foreground">
            총 {project.callSheets?.length || 0}개의 일촬표
          </p>
        </div>

        {/* 프로젝트 기본 정보 입력 카드 */}
        <Card
          className="mb-3 hover:border-primary/50 transition-colors cursor-pointer border-dashed"
          onClick={() => router.push(`/projects/${projectId}/settings`)}
        >
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">프로젝트 기본 정보 입력</span>
              <span className="text-sm text-muted-foreground">
                (스태프, 배우 등록)
              </span>
            </div>
          </CardContent>
        </Card>

        {!project.callSheets || project.callSheets.length === 0 ? (
          <Card
            className="border-dashed hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => router.push(`/projects/${projectId}/call-sheet/create`)}
          >
            <CardContent className="py-8 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-lg font-medium">첫 일촬표 만들기</span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {project.callSheets.map((callSheet: DailyCallSheet) => (
              <Card
                key={callSheet.id}
                className="group hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/projects/${projectId}/call-sheet/${callSheet.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">
                          {callSheet.shootingDay}회차
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {dayjs(callSheet.date).format("YYYY년 M월 D일 (ddd)")}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {callSheet.episode && <span>{callSheet.episode} · </span>}
                        {callSheet.location && <span>{callSheet.location} · </span>}
                        <span>씬 {callSheet.scenes?.length || 0}개</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/projects/${projectId}/call-sheet/${callSheet.id}/preview`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          미리보기
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(callSheet.id!)}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <a href={`/api/call-sheet/${callSheet.id}/excel`}>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          엑셀
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>일촬표 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              {callSheet.shootingDay}회차 일촬표를 삭제하시겠습니까?
                              <br />
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCallSheet(callSheet.id!)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 새 일촬표 추가 카드 */}
            <Card
              className="border-dashed hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/projects/${projectId}/call-sheet/create`)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  <span className="text-lg font-medium">새 일촬표</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

