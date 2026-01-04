import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

interface RouteParams {
  params: { id: string };
}

// GET: 프로젝트 스태프 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const staffList = await db.projectStaff.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(staffList);
  } catch (error) {
    console.error("Failed to fetch project staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch project staff" },
      { status: 500 }
    );
  }
}

// POST: 프로젝트 스태프 추가
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    const staff = await db.projectStaff.create({
      data: {
        projectId: params.id,
        name: body.name,
        position: body.position,
        contact: body.contact || null,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Failed to create project staff:", error);
    return NextResponse.json(
      { error: "Failed to create project staff" },
      { status: 500 }
    );
  }
}

// PUT: 프로젝트 스태프 일괄 업데이트 (전체 교체)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const staffList = body.staffList || [];

    // 기존 스태프 삭제
    await db.projectStaff.deleteMany({
      where: { projectId: params.id },
    });

    // 새 스태프 개별 생성 (SQLite는 createMany 미지원)
    for (const staff of staffList) {
      await db.projectStaff.create({
        data: {
          projectId: params.id,
          name: staff.name,
          position: staff.position,
          contact: staff.contact || null,
        },
      });
    }

    const updatedStaffList = await db.projectStaff.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(updatedStaffList);
  } catch (error) {
    console.error("Failed to update project staff:", error);
    return NextResponse.json(
      { error: "Failed to update project staff" },
      { status: 500 }
    );
  }
}

