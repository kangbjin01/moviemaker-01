import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET: 프로젝트 목록 조회
export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        _count: {
          select: { callSheets: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "프로젝트 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// POST: 새 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const project = await db.project.create({
      data: {
        title: body.title,
        type: body.type || null,
        productionCo: body.productionCo || null,
        director: body.director || null,
        producer: body.producer || null,
        adName: body.adName || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "PREP",
        // MVP: userId 없이 생성 (추후 인증 연동)
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "프로젝트 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

