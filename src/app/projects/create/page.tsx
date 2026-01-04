"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { ProjectFormData, ProjectStatus, ProjectType } from "~/types/call-sheet";
import { toast } from "sonner";

const PROJECT_TYPES: ProjectType[] = ["영화", "드라마", "웹드라마", "광고", "뮤직비디오", "기타"];
const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "PREP", label: "준비중" },
  { value: "SHOOTING", label: "촬영중" },
  { value: "POST", label: "후반작업" },
  { value: "COMPLETED", label: "완료" },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    type: null,
    productionCo: null,
    director: null,
    producer: null,
    adName: null,
    startDate: null,
    endDate: null,
    status: "PREP",
  });

  const handleChange = (field: keyof ProjectFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("작품명을 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const project = await response.json();
        toast.success("프로젝트가 생성되었습니다");
        router.push(`/projects/${project.id}`);
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("프로젝트 생성에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            프로젝트 목록
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">새 프로젝트</h1>
          <p className="text-muted-foreground mt-1">
            영화/드라마 프로젝트 정보를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>
                프로젝트의 기본 정보를 입력합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 작품명 */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  작품명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="예: 마이 러브"
                  required
                />
              </div>

              {/* 작품 유형 & 상태 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>작품 유형</Label>
                  <Select
                    value={formData.type || ""}
                    onValueChange={(v) => handleChange("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>진행 상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => handleChange("status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 제작사 */}
              <div className="space-y-2">
                <Label htmlFor="productionCo">제작사</Label>
                <Input
                  id="productionCo"
                  value={formData.productionCo || ""}
                  onChange={(e) => handleChange("productionCo", e.target.value)}
                  placeholder="예: ABC 필름"
                />
              </div>

              {/* 감독 & 프로듀서 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">감독</Label>
                  <Input
                    id="director"
                    value={formData.director || ""}
                    onChange={(e) => handleChange("director", e.target.value)}
                    placeholder="감독명"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer">프로듀서</Label>
                  <Input
                    id="producer"
                    value={formData.producer || ""}
                    onChange={(e) => handleChange("producer", e.target.value)}
                    placeholder="프로듀서명"
                  />
                </div>
              </div>

              {/* 조연출 */}
              <div className="space-y-2">
                <Label htmlFor="adName">조연출 (1AD)</Label>
                <Input
                  id="adName"
                  value={formData.adName || ""}
                  onChange={(e) => handleChange("adName", e.target.value)}
                  placeholder="조연출명"
                />
              </div>

              {/* 촬영 일정 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">촬영 시작 예정일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate ? String(formData.startDate).split("T")[0] : ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">촬영 종료 예정일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate ? String(formData.endDate).split("T")[0] : ""}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 mt-6">
            <Link href="/projects">
              <Button type="button" variant="outline">
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "프로젝트 생성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

