"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CallSheetForm } from "~/components/call-sheet/CallSheetForm";
import type { DailyCallSheet } from "~/types/call-sheet";
import { toast } from "sonner";

export default function EditCallSheetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const callSheetId = params.callSheetId as string;

  const [callSheet, setCallSheet] = useState<DailyCallSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCallSheet = async () => {
      try {
        const response = await fetch(`/api/call-sheet/${callSheetId}`);
        if (response.ok) {
          const data = await response.json();
          setCallSheet(data);
        } else {
          toast.error("일촬표를 찾을 수 없습니다");
        }
      } catch (error) {
        console.error("Failed to fetch call sheet:", error);
        toast.error("일촬표를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallSheet();
  }, [callSheetId]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            프로젝트로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {callSheet.shootingDay}회차 편집
          </h1>
          <p className="text-muted-foreground mt-1">
            일일촬영계획표를 수정하세요
          </p>
        </div>

        {/* 폼 */}
        <CallSheetForm
          projectId={projectId}
          initialData={callSheet}
          mode="edit"
        />
      </div>
    </div>
  );
}

