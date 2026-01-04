"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CallSheetForm } from "~/components/call-sheet/CallSheetForm";

export default function CreateCallSheetPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">새 일촬표 만들기</h1>
          <p className="text-muted-foreground mt-1">
            일일촬영계획표의 기본 정보와 촬영 씬을 입력하세요
          </p>
        </div>

        {/* 폼 */}
        <CallSheetForm mode="create" />
      </div>
    </div>
  );
}

