"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CallSheetForm } from "~/components/call-sheet/CallSheetForm";
import type { DailyCallSheet } from "~/types/call-sheet";
import { toast } from "sonner";

export default function EditCallSheetPage() {
  const params = useParams();
  const id = params.id as string;

  const [callSheet, setCallSheet] = useState<DailyCallSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallSheet = async () => {
      try {
        const response = await fetch(`/api/call-sheet/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCallSheet(data);
        } else if (response.status === 404) {
          setError("일촬표를 찾을 수 없습니다");
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (err) {
        console.error("Failed to fetch call sheet:", err);
        setError("일촬표를 불러오는데 실패했습니다");
        toast.error("일촬표를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallSheet();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !callSheet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">
              {error || "일촬표를 찾을 수 없습니다"}
            </h2>
            <p className="text-muted-foreground mb-4">
              요청하신 일촬표가 존재하지 않거나 삭제되었습니다
            </p>
            <Link href="/call-sheet">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/call-sheet">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {callSheet.projectTitle}
          </h1>
          <p className="text-muted-foreground mt-1">
            {callSheet.episode && `${callSheet.episode} · `}
            Day {callSheet.shootingDay}
          </p>
        </div>

        {/* 폼 */}
        <CallSheetForm initialData={callSheet} mode="edit" />
      </div>
    </div>
  );
}

