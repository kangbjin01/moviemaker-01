import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET: 일촬표 목록 조회 (projectId 쿼리 파라미터로 필터링)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const callSheets = await db.dailyCallSheet.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { date: "desc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
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

    return NextResponse.json(callSheets);
  } catch (error) {
    console.error("Failed to fetch call sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch call sheets" },
      { status: 500 }
    );
  }
}

// POST: 새 일촬표 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const { scenes, schedules, staffList, castMembers, ...callSheetData } = body;

    const callSheet = await db.dailyCallSheet.create({
      data: {
        projectId: callSheetData.projectId,
        episode: callSheetData.episode || null,
        shootingDay: callSheetData.shootingDay,
        date: new Date(callSheetData.date),
        weather: callSheetData.weather || null,
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
              create: scenes.map((scene: { order: number; sceneNumber: string; [key: string]: unknown }, index: number) => ({
                ...scene,
                order: scene.order ?? index,
              })),
            }
          : undefined,
        // 전체 일정
        schedules: schedules?.length
          ? {
              create: schedules.map((s: { order: number; [key: string]: unknown }, index: number) => ({
                ...s,
                order: s.order ?? index,
              })),
            }
          : undefined,
        // 스태프
        staffList: staffList?.length
          ? {
              create: staffList.map((s: { order: number; [key: string]: unknown }, index: number) => ({
                ...s,
                order: s.order ?? index,
              })),
            }
          : undefined,
        // 캐스트
        castMembers: castMembers?.length
          ? {
              create: castMembers.map((c: { order: number; [key: string]: unknown }, index: number) => ({
                ...c,
                order: c.order ?? index,
              })),
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

    return NextResponse.json(callSheet, { status: 201 });
  } catch (error) {
    console.error("Failed to create call sheet:", error);
    return NextResponse.json(
      { error: "Failed to create call sheet" },
      { status: 500 }
    );
  }
}
