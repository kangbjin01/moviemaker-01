"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
import type { Project, ProjectFormData, ProjectStatus, ProjectType, ProjectStaff, ProjectCast } from "~/types/call-sheet";
import { toast } from "sonner";

const PROJECT_TYPES: ProjectType[] = ["영화", "드라마", "웹드라마", "광고", "뮤직비디오", "기타"];
const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "PREP", label: "준비중" },
  { value: "SHOOTING", label: "촬영중" },
  { value: "POST", label: "후반작업" },
  { value: "COMPLETED", label: "완료" },
];

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
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

  // 프로젝트 스태프/캐스트 상태
  const [staffList, setStaffList] = useState<ProjectStaff[]>([]);
  const [castList, setCastList] = useState<ProjectCast[]>([]);
  const [staffDirty, setStaffDirty] = useState(false);
  const [castDirty, setCastDirty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, staffRes, castRes] = await Promise.all([
          fetch(`/api/project/${projectId}`),
          fetch(`/api/project/${projectId}/staff`),
          fetch(`/api/project/${projectId}/cast`),
        ]);

        if (projectRes.ok) {
          const data: Project = await projectRes.json();
          setFormData({
            title: data.title,
            type: data.type || null,
            productionCo: data.productionCo || null,
            director: data.director || null,
            producer: data.producer || null,
            adName: data.adName || null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            status: data.status,
          });
        } else {
          toast.error("프로젝트를 찾을 수 없습니다");
          router.push("/projects");
          return;
        }

        if (staffRes.ok) {
          setStaffList(await staffRes.json());
        }

        if (castRes.ok) {
          setCastList(await castRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("데이터를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, router]);

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
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("프로젝트가 저장되었습니다");
      } else {
        throw new Error("Failed to save project");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("저장에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("프로젝트가 삭제되었습니다");
        router.push("/projects");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("삭제에 실패했습니다");
    }
  };

  // 스태프 관련 핸들러
  const handleAddStaff = useCallback(() => {
    setStaffList((prev) => [...prev, { name: "", position: "", contact: "" }]);
    setStaffDirty(true);
  }, []);

  const handleStaffChange = useCallback((index: number, field: keyof ProjectStaff, value: string) => {
    setStaffList((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index]!, [field]: value };
      return newList;
    });
    setStaffDirty(true);
  }, []);

  const handleRemoveStaff = useCallback((index: number) => {
    setStaffList((prev) => prev.filter((_, i) => i !== index));
    setStaffDirty(true);
  }, []);

  const handleSaveStaff = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/staff`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffList: staffList.filter(s => s.name.trim()) }),
      });

      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
        setStaffDirty(false);
        toast.success("스태프 목록이 저장되었습니다");
      } else {
        throw new Error("Failed to save staff");
      }
    } catch (error) {
      console.error("Failed to save staff:", error);
      toast.error("스태프 저장에 실패했습니다");
    }
  };

  // 캐스트 관련 핸들러
  const handleAddCast = useCallback(() => {
    setCastList((prev) => [...prev, { actorName: "", role: "", contact: "" }]);
    setCastDirty(true);
  }, []);

  const handleCastChange = useCallback((index: number, field: keyof ProjectCast, value: string) => {
    setCastList((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index]!, [field]: value };
      return newList;
    });
    setCastDirty(true);
  }, []);

  const handleRemoveCast = useCallback((index: number) => {
    setCastList((prev) => prev.filter((_, i) => i !== index));
    setCastDirty(true);
  }, []);

  const handleSaveCast = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/cast`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castList: castList.filter(c => c.actorName.trim()) }),
      });

      if (response.ok) {
        const data = await response.json();
        setCastList(data);
        setCastDirty(false);
        toast.success("배우 목록이 저장되었습니다");
      } else {
        throw new Error("Failed to save cast");
      }
    } catch (error) {
      console.error("Failed to save cast:", error);
      toast.error("배우 저장에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            프로젝트로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">프로젝트 설정</h1>
          <p className="text-muted-foreground mt-1">
            프로젝트 정보와 스태프/배우를 관리하세요
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="staff">스태프</TabsTrigger>
            <TabsTrigger value="cast">배우</TabsTrigger>
          </TabsList>

          {/* 기본 정보 탭 */}
          <TabsContent value="basic">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    프로젝트의 기본 정보를 수정합니다
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
              <div className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      프로젝트 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        &apos;{formData.title}&apos; 프로젝트를 삭제하시겠습니까?
                        <br />
                        <span className="text-destructive font-medium">
                          모든 일촬표도 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* 스태프 탭 */}
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>스태프 관리</CardTitle>
                <CardDescription>
                  프로젝트에 참여하는 스태프를 등록하면 일촬표 작성 시 선택할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    등록된 스태프가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {staffList.map((staff, index) => (
                      <div key={staff.id || index} className="flex gap-2 items-start">
                        <Input
                          value={staff.name}
                          onChange={(e) => handleStaffChange(index, "name", e.target.value)}
                          placeholder="이름"
                          className="flex-1"
                        />
                        <Input
                          value={staff.position}
                          onChange={(e) => handleStaffChange(index, "position", e.target.value)}
                          placeholder="직책"
                          className="flex-1"
                        />
                        <Input
                          value={staff.contact || ""}
                          onChange={(e) => handleStaffChange(index, "contact", e.target.value)}
                          placeholder="연락처"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStaff(index)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleAddStaff}>
                    <Plus className="h-4 w-4 mr-2" />
                    스태프 추가
                  </Button>
                  <Button onClick={handleSaveStaff} disabled={!staffDirty}>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 배우 탭 */}
          <TabsContent value="cast">
            <Card>
              <CardHeader>
                <CardTitle>배우 관리</CardTitle>
                <CardDescription>
                  프로젝트에 출연하는 배우를 등록하면 일촬표 작성 시 선택할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {castList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    등록된 배우가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {castList.map((cast, index) => (
                      <div key={cast.id || index} className="flex gap-2 items-start">
                        <Input
                          value={cast.actorName}
                          onChange={(e) => handleCastChange(index, "actorName", e.target.value)}
                          placeholder="연기자 이름"
                          className="flex-1"
                        />
                        <Input
                          value={cast.role}
                          onChange={(e) => handleCastChange(index, "role", e.target.value)}
                          placeholder="배역"
                          className="flex-1"
                        />
                        <Input
                          value={cast.contact || ""}
                          onChange={(e) => handleCastChange(index, "contact", e.target.value)}
                          placeholder="연락처"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCast(index)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleAddCast}>
                    <Plus className="h-4 w-4 mr-2" />
                    배우 추가
                  </Button>
                  <Button onClick={handleSaveCast} disabled={!castDirty}>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
