"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CallSheetForm } from "~/components/call-sheet/CallSheetForm";

export default function CreateCallSheetPage() {
  const params = useParams();
  const projectId = params.id as string;

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
          <h1 className="text-3xl font-bold tracking-tight">새 일촬표</h1>
          <p className="text-muted-foreground mt-1">
            일일촬영계획표를 작성하세요
          </p>
        </div>

        {/* 폼 */}
        <CallSheetForm projectId={projectId} mode="create" />
      </div>
    </div>
  );
}

