import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import ExcelJS from "exceljs";
import dayjs from "dayjs";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const callSheet = await db.dailyCallSheet.findUnique({
      where: { id: params.id },
      include: {
        scenes: {
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

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MovieMaker";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("일일촬영계획표", {
      pageSetup: {
        orientation: "landscape",
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    // 제목 행
    worksheet.mergeCells("A1:J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${callSheet.projectTitle} - Day ${callSheet.shootingDay}`;
    titleCell.font = { bold: true, size: 18 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    // 기본 정보 행
    worksheet.mergeCells("A2:J2");
    const infoCell = worksheet.getCell("A2");
    const infoItems = [
      `촬영일: ${dayjs(callSheet.date).format("YYYY년 M월 D일")}`,
      callSheet.director && `감독: ${callSheet.director}`,
      callSheet.location && `장소: ${callSheet.location}`,
      callSheet.crewCallTime && `스태프 콜: ${callSheet.crewCallTime}`,
      callSheet.talentCallTime && `배우 콜: ${callSheet.talentCallTime}`,
    ]
      .filter(Boolean)
      .join(" | ");
    infoCell.value = infoItems;
    infoCell.font = { size: 10 };
    infoCell.alignment = { horizontal: "center" };

    // 빈 행
    worksheet.addRow([]);

    // 씬 테이블 헤더
    const headerRow = worksheet.addRow([
      "#",
      "씬",
      "INT/EXT",
      "장소",
      "D/N",
      "설명",
      "출연진",
      "페이지",
      "시간(분)",
      "비고",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 씬 데이터
    callSheet.scenes.forEach((scene, index) => {
      const row = worksheet.addRow([
        index + 1,
        scene.sceneNumber,
        scene.locationType || "-",
        scene.locationName || "-",
        scene.dayNight || "-",
        scene.description || "-",
        scene.cast || "-",
        scene.pages || "-",
        scene.estimatedTime || "-",
        scene.notes || "-",
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });

    // 컬럼 너비 설정
    worksheet.columns = [
      { width: 5 }, // #
      { width: 10 }, // 씬
      { width: 10 }, // INT/EXT
      { width: 20 }, // 장소
      { width: 8 }, // D/N
      { width: 30 }, // 설명
      { width: 20 }, // 출연진
      { width: 8 }, // 페이지
      { width: 10 }, // 시간
      { width: 25 }, // 비고
    ];

    // 공지사항 (있는 경우)
    if (callSheet.generalNotes) {
      worksheet.addRow([]);
      worksheet.addRow([]);
      const notesRow = worksheet.addRow(["공지사항"]);
      notesRow.getCell(1).font = { bold: true, size: 12 };

      worksheet.mergeCells(
        `A${worksheet.rowCount + 1}:J${worksheet.rowCount + 1}`
      );
      const notesContentRow = worksheet.addRow([callSheet.generalNotes]);
      notesContentRow.getCell(1).alignment = { wrapText: true };
    }

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 파일명 생성
    const filename = `${callSheet.projectTitle}_Day${callSheet.shootingDay}_${dayjs(callSheet.date).format("YYYYMMDD")}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error("Failed to generate Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel" },
      { status: 500 }
    );
  }
}

