"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { ArrowLeft, Printer, Download, FileDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { downloadCallSheetPDF } from "~/components/call-sheet/CallSheetPDF";
import type { DailyCallSheet, Project } from "~/types/call-sheet";
import { toast } from "sonner";

dayjs.locale("ko");

// 끝 시간 계산 함수
function calculateEndTime(startTime: string | null | undefined, estimatedTime: number | null | undefined): string {
  if (!startTime || !estimatedTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  if (isNaN(hours!) || isNaN(minutes!)) return "";
  const totalMinutes = hours! * 60 + minutes! + estimatedTime;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export default function CallSheetPreviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const callSheetId = params.callSheetId as string;

  const [callSheet, setCallSheet] = useState<DailyCallSheet | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [csResponse, projResponse] = await Promise.all([
          fetch(`/api/call-sheet/${callSheetId}`),
          fetch(`/api/project/${projectId}`),
        ]);

        if (csResponse.ok) {
          const csData = await csResponse.json();
          setCallSheet(csData);
        }

        if (projResponse.ok) {
          const projData = await projResponse.json();
          setProject(projData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("데이터를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [callSheetId, projectId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    window.open(`/api/call-sheet/${callSheetId}/excel`, "_blank");
  };

  const handleExportPDF = async () => {
    if (!callSheet || !project) return;
    
    try {
      toast.loading("PDF 생성 중...", { id: "pdf-generating" });
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

  if (!callSheet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">일촬표를 찾을 수 없습니다</h2>
          <Link href={`/projects/${projectId}`}>
            <span className="text-primary hover:underline">프로젝트로 돌아가기</span>
          </Link>
        </div>
      </div>
    );
  }

  // 총 촬영 시간 계산
  const totalShootingMinutes = callSheet.scenes?.reduce((acc, scene) => {
    return acc + (scene.estimatedTime || 0);
  }, 0) || 0;
  const totalHours = Math.floor(totalShootingMinutes / 60);
  const totalMinutes = totalShootingMinutes % 60;

  return (
    <div className="min-h-screen bg-white">
      {/* 인쇄 시 숨김 처리되는 상단 컨트롤 */}
      <div className="print:hidden bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-[1100px] flex justify-between items-center">
          <Link
            href={`/projects/${projectId}/call-sheet/${callSheetId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            편집으로 돌아가기
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              엑셀
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              인쇄
            </Button>
          </div>
        </div>
      </div>

      {/* PDF 내용 */}
      <div className="pdf-content p-6 print:p-4 max-w-[1100px] mx-auto text-black bg-white">
        
        {/* 헤더: 프로젝트명 */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">
            &lt; {project?.title || "프로젝트명"} &gt; 일일촬영계획표
          </h1>
        </div>

        {/* 기본 정보 테이블 */}
        <table className="w-full border-collapse text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-semibold w-20 text-center">
                {callSheet.shootingDay}회차
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-20">촬영일시</td>
              <td className="border border-gray-400 px-2 py-1.5 w-32">
                {dayjs(callSheet.date).format("YYYY.MM.DD (ddd)")}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-20">집합시간</td>
              <td className="border border-gray-400 px-2 py-1.5 w-16">
                {callSheet.crewCallTime || "-"}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-16">날씨</td>
              <td className="border border-gray-400 px-2 py-1.5 w-20">
                {callSheet.weather || "-"}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-20">일출/일몰</td>
              <td className="border border-gray-400 px-2 py-1.5">
                {callSheet.sunrise || "-"} / {callSheet.sunset || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50" rowSpan={2}></td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">촬영장소</td>
              <td className="border border-gray-400 px-2 py-1.5" colSpan={2}>
                {callSheet.location || "-"}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">Shooting</td>
              <td className="border border-gray-400 px-2 py-1.5" colSpan={2}>
                {totalHours > 0 ? `${totalHours}h ` : ""}{totalMinutes}m
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">감독</td>
              <td className="border border-gray-400 px-2 py-1.5">
                {callSheet.director || "-"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">주소</td>
              <td className="border border-gray-400 px-2 py-1.5" colSpan={4}>
                {callSheet.address || "-"}
              </td>
              <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">조연출</td>
              <td className="border border-gray-400 px-2 py-1.5" colSpan={2}>
                {callSheet.adName || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 촬영 씬 섹션 */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-2 border-b-2 border-black pb-1">촬영 씬</h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-1.5 py-1 text-center w-12">촬영순서</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-10">S#</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-10">CUT</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-12">M/D<br/>E/N</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-10">I/E</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-12">시작</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center w-12">끝</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center">촬영장소</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center">촬영내용</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center">주요인물</th>
                <th className="border border-gray-400 px-1.5 py-1 text-center">비고</th>
              </tr>
            </thead>
            <tbody>
              {callSheet.scenes && callSheet.scenes.length > 0 ? (
                callSheet.scenes.map((scene, index) => {
                  const endTime = calculateEndTime(scene.startTime, scene.estimatedTime);
                  return (
                    <tr key={scene.id || index}>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">{index + 1}</td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center font-medium">
                        {scene.sceneNumber?.replace("S#", "") || "-"}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">
                        {scene.pages || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">
                        {scene.dayNight || "-"}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">
                        {scene.locationType === "INT" ? "I" : scene.locationType === "EXT" ? "E" : scene.locationType === "INT/EXT" ? "I/E" : "-"}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">
                        {scene.startTime || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-center">
                        {endTime || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1">
                        {scene.locationName || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1">
                        {scene.description || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1">
                        {scene.cast || ""}
                      </td>
                      <td className="border border-gray-400 px-1.5 py-1 text-xs">
                        {scene.notes || ""}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="border border-gray-400 px-4 py-8 text-center text-gray-500">
                    등록된 씬이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 공지사항 (있는 경우만) */}
        {callSheet.generalNotes && (
          <div className="mb-4">
            <h2 className="text-sm font-bold mb-2 border-b-2 border-black pb-1">공지사항</h2>
            <div className="border border-gray-400 p-3 text-sm whitespace-pre-wrap">
              {callSheet.generalNotes}
            </div>
          </div>
        )}

        {/* 추가 정보 그리드 */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* 주차/연락처 정보 */}
          <div>
            <h2 className="text-sm font-bold mb-2 border-b-2 border-black pb-1">기타 정보</h2>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-24">주차 정보</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.parkingInfo || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">비상 연락처</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.emergencyContact || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">배우 콜타임</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.talentCallTime || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">프로듀서</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.producer || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 제작진 정보 */}
          <div>
            <h2 className="text-sm font-bold mb-2 border-b-2 border-black pb-1">제작진</h2>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium w-24">감독</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.director || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">프로듀서</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.producer || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1.5 bg-gray-50 font-medium">조연출</td>
                  <td className="border border-gray-400 px-2 py-1.5">{callSheet.adName || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지 번호 (인쇄용) */}
        <div className="mt-8 text-center text-xs text-gray-400 print:block hidden">
          {project?.title} - {callSheet.shootingDay}회차 일일촬영계획표
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11px;
          }
          
          .pdf-content {
            max-width: 100%;
            padding: 0;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
        }
        
        @media screen {
          .pdf-content {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 20px auto;
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
