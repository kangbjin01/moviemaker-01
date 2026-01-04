import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

interface RouteParams {
  params: { id: string };
}

// GET: 특정 일촬표 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const callSheet = await db.dailyCallSheet.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        scenes: {
          orderBy: { order: "asc" },
        },
        schedules: {
          orderBy: { order: "asc" },
        },
        staffList: {
          orderBy: { order: "asc" },
        },
        castMembers: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!callSheet) {
      return NextResponse.json(
        { error: "Call sheet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(callSheet);
  } catch (error) {
    console.error("Failed to fetch call sheet:", error);
    return NextResponse.json(
      { error: "Failed to fetch call sheet" },
      { status: 500 }
    );
  }
}

// PUT: 일촬표 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { scenes, schedules, staffList, castMembers, project, ...callSheetData } = body;

    // 기존 관계 데이터 삭제
    await Promise.all([
      db.scene.deleteMany({ where: { callSheetId: params.id } }),
      db.schedule.deleteMany({ where: { callSheetId: params.id } }),
      db.staff.deleteMany({ where: { callSheetId: params.id } }),
      db.castMember.deleteMany({ where: { callSheetId: params.id } }),
    ]);

    const callSheet = await db.dailyCallSheet.update({
      where: { id: params.id },
      data: {
        episode: callSheetData.episode || null,
        shootingDay: callSheetData.shootingDay,
        date: callSheetData.date ? new Date(callSheetData.date) : undefined,
        weather: callSheetData.weather || null,
        tempMin: callSheetData.tempMin || null,
        tempMax: callSheetData.tempMax || null,
        precipitation: callSheetData.precipitation || null,
        sunrise: callSheetData.sunrise || null,
        sunset: callSheetData.sunset || null,
        director: callSheetData.director || null,
        producer: callSheetData.producer || null,
        adName: callSheetData.adName || null,
        location: callSheetData.location || null,
        address: callSheetData.address || null,
        meetingPlace: callSheetData.meetingPlace || null,
        parkingInfo: callSheetData.parkingInfo || null,
        emergencyContact: callSheetData.emergencyContact || null,
        crewCallTime: callSheetData.crewCallTime || null,
        talentCallTime: callSheetData.talentCallTime || null,
        generalNotes: callSheetData.generalNotes || null,
        // 세부 진행
        detailDirection: callSheetData.detailDirection || null,
        detailAssistDir: callSheetData.detailAssistDir || null,
        detailLighting: callSheetData.detailLighting || null,
        detailWardrobe: callSheetData.detailWardrobe || null,
        detailSound: callSheetData.detailSound || null,
        detailProduction: callSheetData.detailProduction || null,
        detailArt: callSheetData.detailArt || null,
        detailCamera: callSheetData.detailCamera || null,
        detailEtc: callSheetData.detailEtc || null,
        // 씬 목록
        scenes: scenes?.length
          ? {
              create: scenes.map((scene: { order: number; sceneNumber: string; [key: string]: unknown }, index: number) => {
                // id와 callSheetId 제외
                const { id, callSheetId, createdAt, updatedAt, ...sceneData } = scene as Record<string, unknown>;
                return {
                  ...sceneData,
                  order: (scene.order as number) ?? index,
                };
              }),
            }
          : undefined,
        // 전체 일정
        schedules: schedules?.length
          ? {
              create: schedules.map((s: { order: number; [key: string]: unknown }, index: number) => {
                const { id, callSheetId, createdAt, updatedAt, ...data } = s as Record<string, unknown>;
                return {
                  ...data,
                  order: (s.order as number) ?? index,
                };
              }),
            }
          : undefined,
        // 스태프
        staffList: staffList?.length
          ? {
              create: staffList.map((s: { order: number; [key: string]: unknown }, index: number) => {
                const { id, callSheetId, createdAt, updatedAt, ...data } = s as Record<string, unknown>;
                return {
                  ...data,
                  order: (s.order as number) ?? index,
                };
              }),
            }
          : undefined,
        // 캐스트
        castMembers: castMembers?.length
          ? {
              create: castMembers.map((c: { order: number; [key: string]: unknown }, index: number) => {
                const { id, callSheetId, createdAt, updatedAt, ...data } = c as Record<string, unknown>;
                return {
                  ...data,
                  order: (c.order as number) ?? index,
                };
              }),
            }
          : undefined,
      },
      include: {
        project: true,
        scenes: {
          orderBy: { order: "asc" },
        },
        schedules: {
          orderBy: { order: "asc" },
        },
        staffList: {
          orderBy: { order: "asc" },
        },
        castMembers: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(callSheet);
  } catch (error) {
    console.error("Failed to update call sheet:", error);
    return NextResponse.json(
      { error: "Failed to update call sheet" },
      { status: 500 }
    );
  }
}

// DELETE: 일촬표 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await db.dailyCallSheet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete call sheet:", error);
    return NextResponse.json(
      { error: "Failed to delete call sheet" },
      { status: 500 }
    );
  }
}
