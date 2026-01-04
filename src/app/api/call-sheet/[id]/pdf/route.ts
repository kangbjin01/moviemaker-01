import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

// PDF 출력은 미리보기 페이지의 인쇄 기능을 사용
// 브라우저의 "PDF로 저장" 기능이 가장 깔끔한 결과물을 생성합니다
export async function GET(request: NextRequest, { params }: RouteParams) {
  // 미리보기 페이지로 리디렉트 (인쇄 모드로)
  const baseUrl = request.nextUrl.origin;
  const previewUrl = `${baseUrl}/call-sheet/${params.id}/preview?print=true`;
  
  return NextResponse.redirect(previewUrl);
}

