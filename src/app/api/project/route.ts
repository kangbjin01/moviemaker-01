import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

// GET: 프로젝트 목록 조회 (본인 프로젝트만)
export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const projects = await db.project.findMany({
      where: {
        userId: session.user.id,
      },
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
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

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
        userId: session.user.id,
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
