import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET: 단일 프로젝트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        callSheets: {
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "프로젝트를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// PUT: 프로젝트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const project = await db.project.update({
      where: { id: params.id },
      data: {
        title: body.title,
        type: body.type || null,
        productionCo: body.productionCo || null,
        director: body.director || null,
        producer: body.producer || null,
        adName: body.adName || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "프로젝트 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE: 프로젝트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "프로젝트 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}

