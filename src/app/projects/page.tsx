"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dayjs from "dayjs";
import { Plus, Film, FolderOpen, Calendar, Trash2, Settings, LogOut, User } from "lucide-react";
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
import type { Project, ProjectStatus } from "~/types/call-sheet";
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

interface ProjectWithCount extends Project {
  _count?: {
    callSheets: number;
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/project");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("프로젝트 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("프로젝트가 삭제되었습니다");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("삭제에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 상단 사용자 정보 */}
        <div className="flex justify-end items-center gap-4 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{session?.user?.name || session?.user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
            <p className="text-muted-foreground mt-1">
              영화/드라마 프로젝트를 관리하세요
            </p>
          </div>
          <Link href="/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 프로젝트
            </Button>
          </Link>
        </div>

        {/* 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-muted-foreground">
              불러오는 중...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                아직 프로젝트가 없습니다
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                새 프로젝트를 만들어 촬영 계획을 시작하세요
              </p>
              <Link href="/projects/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 프로젝트 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[project.status as ProjectStatus]}
                        >
                          {STATUS_LABELS[project.status as ProjectStatus]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg truncate">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.type && `${project.type}`}
                        {project.director && ` · ${project.director} 감독`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/projects/${project.id}/settings`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              &apos;{project.title}&apos; 프로젝트를 삭제하시겠습니까?
                              <br />
                              <span className="text-destructive font-medium">
                                모든 일촬표도 함께 삭제됩니다.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project.id!)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {project.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {dayjs(project.startDate).format("YYYY.MM.DD")}
                          {project.endDate && ` ~ ${dayjs(project.endDate).format("MM.DD")}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4" />
                      <span>일촬표 {project._count?.callSheets || 0}개</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        프로젝트 열기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

