"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Save, FileDown, FileSpreadsheet, Cloud, Loader2, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SceneTable } from "./SceneTable";
import { ScheduleTable } from "./ScheduleTable";
import { StaffTable } from "./StaffTable";
import { CastTable } from "./CastTable";
import { DetailedProgressForm } from "./DetailedProgressForm";
import { downloadCallSheetPDF } from "./CallSheetPDF";
import type { DailyCallSheet, Scene, Schedule, Staff, CastMember, CallSheetFormData, Project } from "~/types/call-sheet";
import { toast } from "sonner";

interface CallSheetFormProps {
  projectId: string;
  initialData?: DailyCallSheet;
  mode: "create" | "edit";
}

export function CallSheetForm({ projectId, initialData, mode }: CallSheetFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [highlightFields, setHighlightFields] = useState<string[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<CallSheetFormData>({
    projectId,
    episode: initialData?.episode || "",
    shootingDay: initialData?.shootingDay || 1,
    date: initialData?.date
      ? dayjs(initialData.date).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
    weather: initialData?.weather || "",
    tempMin: initialData?.tempMin || "",
    tempMax: initialData?.tempMax || "",
    precipitation: initialData?.precipitation || "",
    sunrise: initialData?.sunrise || "",
    sunset: initialData?.sunset || "",
    director: initialData?.director || "",
    producer: initialData?.producer || "",
    adName: initialData?.adName || "",
    location: initialData?.location || "",
    address: initialData?.address || "",
    meetingPlace: initialData?.meetingPlace || "",
    parkingInfo: initialData?.parkingInfo || "",
    emergencyContact: initialData?.emergencyContact || "",
    crewCallTime: initialData?.crewCallTime || "",
    talentCallTime: initialData?.talentCallTime || "",
    generalNotes: initialData?.generalNotes || "",
    // 세부 진행
    detailDirection: initialData?.detailDirection || "",
    detailAssistDir: initialData?.detailAssistDir || "",
    detailLighting: initialData?.detailLighting || "",
    detailWardrobe: initialData?.detailWardrobe || "",
    detailSound: initialData?.detailSound || "",
    detailProduction: initialData?.detailProduction || "",
    detailArt: initialData?.detailArt || "",
    detailCamera: initialData?.detailCamera || "",
    detailEtc: initialData?.detailEtc || "",
    // 관계 데이터
    scenes: initialData?.scenes || [],
    schedules: initialData?.schedules || [],
    staffList: initialData?.staffList || [],
    castMembers: initialData?.castMembers || [],
  });

  // 프로젝트 정보 가져오기 (새 일촬표 생성 시 기본값 설정)
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);

          // 새 일촬표 생성 시 프로젝트 기본값 적용
          if (mode === "create") {
            setFormData((prev) => ({
              ...prev,
              director: prev.director || data.director || "",
              producer: prev.producer || data.producer || "",
              adName: prev.adName || data.adName || "",
              // 촬영 일차 자동 계산 (기존 일촬표 개수 + 1)
              shootingDay: (data.callSheets?.length || 0) + 1,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    fetchProject();
  }, [projectId, mode]);

  const handleInputChange = useCallback(
    (field: keyof CallSheetFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleScenesChange = useCallback((scenes: Scene[]) => {
    setFormData((prev) => ({ ...prev, scenes }));
  }, []);

  const handleSchedulesChange = useCallback((schedules: Schedule[]) => {
    setFormData((prev) => ({ ...prev, schedules }));
  }, []);

  const handleStaffChange = useCallback((staffList: Staff[]) => {
    setFormData((prev) => ({ ...prev, staffList }));
  }, []);

  const handleCastChange = useCallback((castMembers: CastMember[]) => {
    setFormData((prev) => ({ ...prev, castMembers }));
  }, []);

  const handleDetailChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFetchWeather = async () => {
    const missingFields: string[] = [];
    if (!formData.location) missingFields.push("location");
    if (!formData.date) missingFields.push("date");
    
    if (missingFields.length > 0) {
      setHighlightFields(missingFields);
      toast.error("촬영장소와 촬영날짜를 먼저 입력해주세요");
      // 3초 후 하이라이트 제거
      setTimeout(() => setHighlightFields([]), 3000);
      return;
    }

    setIsLoadingWeather(true);
    try {
      const dateStr = typeof formData.date === "string" 
        ? formData.date 
        : dayjs(formData.date).format("YYYY-MM-DD");
      
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(formData.location)}&date=${dateStr}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "날씨 정보를 가져오는데 실패했습니다");
      }

      const weatherData = await response.json();

      setFormData((prev) => ({
        ...prev,
        weather: weatherData.weather || prev.weather,
        tempMin: weatherData.tempMin || prev.tempMin,
        tempMax: weatherData.tempMax || prev.tempMax,
        precipitation: weatherData.precipitation || prev.precipitation,
        sunrise: weatherData.sunrise || prev.sunrise,
        sunset: weatherData.sunset || prev.sunset,
      }));

      toast.success("날씨 정보가 입력되었습니다");
    } catch (error) {
      console.error("날씨 가져오기 실패:", error);
      toast.error(error instanceof Error ? error.message : "날씨 정보를 가져오는데 실패했습니다");
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // 카카오 주소 검색 (Daum Postcode)
  const handleSearchAddress = () => {
    // @ts-expect-error - daum is loaded from external script
    if (typeof window !== "undefined" && window.daum?.Postcode) {
      // @ts-expect-error - daum is loaded from external script
      new window.daum.Postcode({
        oncomplete: (data: {
          address: string;
          roadAddress: string;
          jibunAddress: string;
          bname: string;
          buildingName: string;
        }) => {
          // 도로명 주소 우선, 없으면 지번 주소
          const fullAddress = data.roadAddress || data.jibunAddress;
          
          setFormData((prev) => ({
            ...prev,
            location: fullAddress, // 전체 주소를 촬영장소에 입력
            address: fullAddress,
          }));
          
          toast.success("주소가 입력되었습니다");
        },
      }).open();
    } else {
      toast.error("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSave = async (silent: boolean = false): Promise<DailyCallSheet | null> => {
    setIsLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/call-sheet"
          : `/api/call-sheet/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const savedCallSheet = await response.json();

      if (!silent) {
        toast.success(
          mode === "create" ? "일촬표가 생성되었습니다" : "일촬표가 저장되었습니다"
        );
      }

      if (mode === "create") {
        router.push(`/projects/${projectId}/call-sheet/${savedCallSheet.id}`);
        return null;
      }

      return savedCallSheet;
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("저장에 실패했습니다");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!project) {
      toast.error("프로젝트 정보를 불러오는 중입니다");
      return;
    }

    try {
      toast.loading("저장 및 PDF 생성 중...", { id: "pdf-generating" });
      
      // 먼저 저장
      const savedCallSheet = await handleSave(true);
      
      if (!savedCallSheet && mode === "edit") {
        // edit 모드에서 저장 실패
        toast.error("저장에 실패했습니다", { id: "pdf-generating" });
        return;
      }
      
      // 서버에서 최신 데이터 가져오기
      const callSheetId = savedCallSheet?.id || initialData?.id;
      if (!callSheetId) {
        toast.error("일촬표 ID를 찾을 수 없습니다", { id: "pdf-generating" });
        return;
      }
      
      const response = await fetch(`/api/call-sheet/${callSheetId}`);
      if (!response.ok) {
        throw new Error("데이터를 불러오는데 실패했습니다");
      }
      const latestCallSheet = await response.json();
      
      await downloadCallSheetPDF(latestCallSheet, project);
      toast.success("저장 완료 및 PDF 다운로드됨", { id: "pdf-generating" });
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast.error("PDF 생성에 실패했습니다", { id: "pdf-generating" });
    }
  };

  const handleExportExcel = async () => {
    if (!project) {
      toast.error("프로젝트 정보를 불러오는 중입니다");
      return;
    }

    try {
      toast.loading("저장 및 엑셀 생성 중...", { id: "excel-generating" });
      
      // 먼저 저장
      const savedCallSheet = await handleSave(true);
      
      if (!savedCallSheet && mode === "edit") {
        toast.error("저장에 실패했습니다", { id: "excel-generating" });
        return;
      }
      
      const callSheetId = savedCallSheet?.id || initialData?.id;
      if (!callSheetId) {
        toast.error("일촬표 ID를 찾을 수 없습니다", { id: "excel-generating" });
        return;
      }
      
      toast.success("저장 완료. 엑셀 다운로드 중...", { id: "excel-generating" });
      window.open(`/api/call-sheet/${callSheetId}/excel`, "_blank");
    } catch (error) {
      console.error("엑셀 생성 실패:", error);
      toast.error("엑셀 생성에 실패했습니다", { id: "excel-generating" });
    }
  };

  return (
    <div className="space-y-6">
      {/* 프로젝트 정보 표시 */}
      {project && (
        <div className="bg-muted/30 rounded-lg px-4 py-3 text-sm">
          <span className="text-muted-foreground">프로젝트:</span>{" "}
          <span className="font-medium">{project.title}</span>
          {project.type && (
            <span className="text-muted-foreground"> · {project.type}</span>
          )}
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-3 justify-end">
        {mode === "edit" && (
          <>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              PDF 출력
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              엑셀 출력
            </Button>
          </>
        )}
        <Button onClick={() => handleSave(false)} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <Tabs defaultValue="basic" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="schedule">전체 일정</TabsTrigger>
            <TabsTrigger value="scenes">촬영 씬</TabsTrigger>
            <TabsTrigger value="staff">제작진/스태프</TabsTrigger>
            <TabsTrigger value="cast">캐스트</TabsTrigger>
          </TabsList>
        </div>

        {/* 탭 1: 기본 정보 */}
        <TabsContent value="basic" className="space-y-8">
          {/* 1. 기본 정보 */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shootingDay">촬영 회차</Label>
                <Input
                  id="shootingDay"
                  type="number"
                  min="1"
                  value={formData.shootingDay}
                  onChange={(e) =>
                    handleInputChange("shootingDay", parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="episode">회차/에피소드</Label>
                <Input
                  id="episode"
                  value={formData.episode || ""}
                  onChange={(e) => handleInputChange("episode", e.target.value)}
                  placeholder="예: EP.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">촬영 날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={
                    typeof formData.date === "string"
                      ? formData.date
                      : dayjs(formData.date).format("YYYY-MM-DD")
                  }
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={highlightFields.includes("date") ? "ring-2 ring-yellow-500 animate-pulse" : ""}
                />
              </div>
            </div>
          </section>

          {/* 2. 촬영 장소 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold">촬영 장소</h3>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSearchAddress}
                className="bg-black hover:bg-gray-800"
              >
                <Search className="h-4 w-4 mr-2" />
                주소 검색
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">촬영장소</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="주소 검색 버튼을 클릭하거나 직접 입력하세요"
                  className={highlightFields.includes("location") ? "ring-2 ring-yellow-500 animate-pulse" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingPlace">집합장소</Label>
                <Input
                  id="meetingPlace"
                  value={formData.meetingPlace || ""}
                  onChange={(e) => handleInputChange("meetingPlace", e.target.value)}
                  placeholder="촬영장소와 동일 시 비워두세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parkingInfo">주차 정보</Label>
                <Input
                  id="parkingInfo"
                  value={formData.parkingInfo || ""}
                  onChange={(e) => handleInputChange("parkingInfo", e.target.value)}
                  placeholder="주차 가능 위치 및 안내"
                />
              </div>
            </div>
          </section>

          {/* 3. 날씨 정보 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold">날씨 정보</h3>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleFetchWeather}
                disabled={isLoadingWeather}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoadingWeather ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    가져오는 중...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    날씨 가져오기
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weather">날씨</Label>
                <Input
                  id="weather"
                  value={formData.weather || ""}
                  onChange={(e) => handleInputChange("weather", e.target.value)}
                  placeholder="맑음"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempMin">최저기온</Label>
                <Input
                  id="tempMin"
                  value={formData.tempMin || ""}
                  onChange={(e) => handleInputChange("tempMin", e.target.value)}
                  placeholder="-5℃"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempMax">최고기온</Label>
                <Input
                  id="tempMax"
                  value={formData.tempMax || ""}
                  onChange={(e) => handleInputChange("tempMax", e.target.value)}
                  placeholder="10℃"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precipitation">강수확률</Label>
                <Input
                  id="precipitation"
                  value={formData.precipitation || ""}
                  onChange={(e) => handleInputChange("precipitation", e.target.value)}
                  placeholder="20%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sunrise">일출</Label>
                <Input
                  id="sunrise"
                  value={formData.sunrise || ""}
                  onChange={(e) => handleInputChange("sunrise", e.target.value)}
                  placeholder="06:30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sunset">일몰</Label>
                <Input
                  id="sunset"
                  value={formData.sunset || ""}
                  onChange={(e) => handleInputChange("sunset", e.target.value)}
                  placeholder="18:30"
                />
              </div>
            </div>
          </section>

          {/* 콜타임 */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">콜타임</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crewCallTime">스태프 콜타임</Label>
                <Input
                  id="crewCallTime"
                  value={formData.crewCallTime || ""}
                  onChange={(e) => handleInputChange("crewCallTime", e.target.value)}
                  placeholder="07:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="talentCallTime">배우 콜타임</Label>
                <Input
                  id="talentCallTime"
                  value={formData.talentCallTime || ""}
                  onChange={(e) => handleInputChange("talentCallTime", e.target.value)}
                  placeholder="08:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">비상 연락처</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
          </section>

          {/* 공지사항 */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">공지사항</h3>
            <Textarea
              value={formData.generalNotes || ""}
              onChange={(e) => handleInputChange("generalNotes", e.target.value)}
              placeholder="전체 공지사항을 입력하세요"
              rows={4}
            />
          </section>
        </TabsContent>

        {/* 탭 2: 전체 일정 */}
        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTable
            schedules={formData.schedules || []}
            onChange={handleSchedulesChange}
          />
        </TabsContent>

        {/* 탭 3: 촬영 씬 */}
        <TabsContent value="scenes" className="space-y-4">
          <SceneTable scenes={formData.scenes} onChange={handleScenesChange} />
        </TabsContent>

        {/* 탭 4: 제작진/스태프 */}
        <TabsContent value="staff" className="space-y-8">
          {/* 제작진 정보 */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2">제작진 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="director">감독</Label>
                <Input
                  id="director"
                  value={formData.director || ""}
                  onChange={(e) => handleInputChange("director", e.target.value)}
                  placeholder="감독명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="producer">프로듀서</Label>
                <Input
                  id="producer"
                  value={formData.producer || ""}
                  onChange={(e) => handleInputChange("producer", e.target.value)}
                  placeholder="프로듀서명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adName">조연출</Label>
                <Input
                  id="adName"
                  value={formData.adName || ""}
                  onChange={(e) => handleInputChange("adName", e.target.value)}
                  placeholder="조연출명"
                />
              </div>
            </div>
          </section>

          {/* 스태프 */}
          <section className="space-y-4">
            <StaffTable
              staffList={formData.staffList || []}
              onChange={handleStaffChange}
              projectId={projectId}
            />
          </section>

          {/* 세부 진행 */}
          <section className="space-y-4">
            <DetailedProgressForm
              values={{
                detailDirection: formData.detailDirection,
                detailAssistDir: formData.detailAssistDir,
                detailLighting: formData.detailLighting,
                detailWardrobe: formData.detailWardrobe,
                detailSound: formData.detailSound,
                detailProduction: formData.detailProduction,
                detailArt: formData.detailArt,
                detailCamera: formData.detailCamera,
                detailEtc: formData.detailEtc,
              }}
              onChange={handleDetailChange}
            />
          </section>
        </TabsContent>

        {/* 탭 5: 캐스트 */}
        <TabsContent value="cast" className="space-y-4">
          <CastTable
            castMembers={formData.castMembers || []}
            onChange={handleCastChange}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>

      {/* 하단 저장 버튼 */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={() => handleSave(false)} disabled={isLoading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
