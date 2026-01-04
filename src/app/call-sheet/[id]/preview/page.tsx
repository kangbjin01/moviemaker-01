"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, FileDown, FileSpreadsheet, Loader2, Printer } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { DailyCallSheet } from "~/types/call-sheet";
import { toast } from "sonner";

export default function PreviewCallSheetPage() {
  const params = useParams();
  const id = params.id as string;

  const [callSheet, setCallSheet] = useState<DailyCallSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCallSheet = async () => {
      try {
        const response = await fetch(`/api/call-sheet/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCallSheet(data);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
        toast.error("일촬표를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallSheet();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!callSheet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">일촬표를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 컨트롤 바 - 인쇄시 숨김 */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/call-sheet/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              편집으로 돌아가기
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              인쇄
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/api/call-sheet/${id}/pdf`, "_blank")}
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/api/call-sheet/${id}/excel`, "_blank")}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              엑셀
            </Button>
          </div>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="bg-white text-black print:shadow-none shadow-lg rounded-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-black text-white p-6 print:p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {callSheet.projectTitle}
                </h1>
                {callSheet.episode && (
                  <p className="text-gray-300 mt-1">{callSheet.episode}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold">
                  DAY {callSheet.shootingDay}
                </div>
                <div className="text-gray-300">
                  {dayjs(callSheet.date).format("YYYY년 M월 D일 (ddd)")}
                </div>
              </div>
            </div>
          </div>

          {/* 기본 정보 그리드 */}
          <div className="p-6 print:p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-200">
            {callSheet.director && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  감독
                </div>
                <div className="font-medium">{callSheet.director}</div>
              </div>
            )}
            {callSheet.producer && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  프로듀서
                </div>
                <div className="font-medium">{callSheet.producer}</div>
              </div>
            )}
            {callSheet.adName && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  조연출
                </div>
                <div className="font-medium">{callSheet.adName}</div>
              </div>
            )}
            {callSheet.weather && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  날씨
                </div>
                <div className="font-medium">{callSheet.weather}</div>
              </div>
            )}
            {callSheet.sunrise && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  일출
                </div>
                <div className="font-medium">{callSheet.sunrise}</div>
              </div>
            )}
            {callSheet.sunset && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  일몰
                </div>
                <div className="font-medium">{callSheet.sunset}</div>
              </div>
            )}
            {callSheet.crewCallTime && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  스태프 콜타임
                </div>
                <div className="font-medium">{callSheet.crewCallTime}</div>
              </div>
            )}
            {callSheet.talentCallTime && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  배우 콜타임
                </div>
                <div className="font-medium">{callSheet.talentCallTime}</div>
              </div>
            )}
          </div>

          {/* 장소 정보 */}
          {(callSheet.location || callSheet.address) && (
            <div className="p-6 print:p-4 border-b border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                촬영 장소
              </div>
              {callSheet.location && (
                <div className="font-semibold text-lg">{callSheet.location}</div>
              )}
              {callSheet.address && (
                <div className="text-gray-600">{callSheet.address}</div>
              )}
              {callSheet.parkingInfo && (
                <div className="text-sm text-gray-500 mt-1">
                  주차: {callSheet.parkingInfo}
                </div>
              )}
            </div>
          )}

          {/* 비상연락처 */}
          {callSheet.emergencyContact && (
            <div className="px-6 print:px-4 py-3 bg-red-50 border-b border-red-200">
              <span className="text-xs text-red-600 uppercase tracking-wider font-medium">
                비상 연락처:
              </span>
              <span className="ml-2 font-semibold text-red-700">
                {callSheet.emergencyContact}
              </span>
            </div>
          )}

          {/* 씬 테이블 */}
          <div className="p-6 print:p-4">
            <h2 className="text-lg font-semibold mb-4">촬영 씬 목록</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      #
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      씬
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      INT/EXT
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      장소
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      D/N
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      설명
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      출연진
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      페이지
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      시간
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {callSheet.scenes.map((scene, index) => (
                    <tr key={scene.id || index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {scene.sceneNumber}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.locationType || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.locationName || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.dayNight || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.description || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.cast || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {scene.pages || "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {scene.estimatedTime ? `${scene.estimatedTime}분` : "-"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {scene.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {callSheet.scenes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                등록된 씬이 없습니다
              </div>
            )}
          </div>

          {/* 공지사항 */}
          {callSheet.generalNotes && (
            <div className="p-6 print:p-4 bg-yellow-50 border-t border-yellow-200">
              <div className="text-xs text-yellow-700 uppercase tracking-wider font-medium mb-2">
                공지사항
              </div>
              <div className="whitespace-pre-wrap text-yellow-900">
                {callSheet.generalNotes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

