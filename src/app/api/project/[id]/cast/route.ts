import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

interface RouteParams {
  params: { id: string };
}

// GET: 프로젝트 캐스트 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const castList = await db.projectCast.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(castList);
  } catch (error) {
    console.error("Failed to fetch project cast:", error);
    return NextResponse.json(
      { error: "Failed to fetch project cast" },
      { status: 500 }
    );
  }
}

// POST: 프로젝트 캐스트 추가
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    const cast = await db.projectCast.create({
      data: {
        projectId: params.id,
        actorName: body.actorName,
        role: body.role,
        contact: body.contact || null,
      },
    });

    return NextResponse.json(cast, { status: 201 });
  } catch (error) {
    console.error("Failed to create project cast:", error);
    return NextResponse.json(
      { error: "Failed to create project cast" },
      { status: 500 }
    );
  }
}

// PUT: 프로젝트 캐스트 일괄 업데이트 (전체 교체)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const castList = body.castList || [];

    // 기존 캐스트 삭제
    await db.projectCast.deleteMany({
      where: { projectId: params.id },
    });

    // 새 캐스트 개별 생성 (SQLite는 createMany 미지원)
    for (const cast of castList) {
      await db.projectCast.create({
        data: {
          projectId: params.id,
          actorName: cast.actorName,
          role: cast.role,
          contact: cast.contact || null,
        },
      });
    }

    const updatedCastList = await db.projectCast.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(updatedCastList);
  } catch (error) {
    console.error("Failed to update project cast:", error);
    return NextResponse.json(
      { error: "Failed to update project cast" },
      { status: 500 }
    );
  }
}

