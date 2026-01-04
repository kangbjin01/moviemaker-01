import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

interface RouteParams {
  params: { id: string };
}

// 끝 시간 계산
function calculateEndTime(startTime: string | null | undefined, estimatedTime: number | null | undefined): string {
  if (!startTime || !estimatedTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  if (isNaN(hours!) || isNaN(minutes!)) return "";
  const totalMinutes = hours! * 60 + minutes! + estimatedTime;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const callSheet = await db.dailyCallSheet.findUnique({
      where: { id: params.id },
      include: {
        scenes: {
          orderBy: { order: "asc" },
        },
        schedules: {
          orderBy: { id: "asc" },
        },
        staffList: {
          orderBy: { id: "asc" },
        },
        castMembers: {
          orderBy: { id: "asc" },
        },
        project: true,
      },
    });

    if (!callSheet) {
      return NextResponse.json(
        { error: "Call sheet not found" },
        { status: 404 }
      );
    }

    const project = callSheet.project;
    const projectTitle = project?.title || callSheet.projectTitle || "프로젝트";

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MovieMaker";
    workbook.created = new Date();

    // === 첫 번째 시트: 기본 정보 + 촬영 씬 ===
    const mainSheet = workbook.addWorksheet("일일촬영계획표", {
      pageSetup: {
        orientation: "landscape",
        paperSize: 9,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    // 제목 행
    mainSheet.mergeCells("A1:L1");
    const titleCell = mainSheet.getCell("A1");
    titleCell.value = `< ${projectTitle} > 일일촬영계획표 - ${callSheet.shootingDay}회차`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    mainSheet.getRow(1).height = 30;

    // 총 촬영 시간 계산
    const totalShootingMinutes = callSheet.scenes?.reduce((acc, scene) => {
      return acc + (scene.estimatedTime || 0);
    }, 0) || 0;
    const totalHours = Math.floor(totalShootingMinutes / 60);
    const totalMinutes = totalShootingMinutes % 60;
    const shootingTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

    // 촬영 종료 시간 계산
    let shootingEndTime = "-";
    if (callSheet.scenes && callSheet.scenes.length > 0) {
      let latestEndTime = "";
      for (const scene of callSheet.scenes) {
        const endTime = calculateEndTime(scene.startTime, scene.estimatedTime);
        if (endTime && endTime > latestEndTime) {
          latestEndTime = endTime;
        }
      }
      if (latestEndTime) {
        shootingEndTime = latestEndTime;
      }
    }

    // 기본 정보 테이블 (행 3부터)
    const infoStartRow = 3;
    const headerStyle: Partial<ExcelJS.Style> = {
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } },
      font: { bold: true, size: 9 },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
    };
    const valueStyle: Partial<ExcelJS.Style> = {
      font: { size: 9 },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { vertical: "middle" },
    };

    // 행 1: 촬영일시, 날씨, 기온, 강수확률
    const row1 = mainSheet.getRow(infoStartRow);
    row1.getCell(1).value = `${callSheet.shootingDay}회차`;
    row1.getCell(1).style = headerStyle;
    row1.getCell(2).value = "촬영일시";
    row1.getCell(2).style = headerStyle;
    row1.getCell(3).value = dayjs(callSheet.date).format("YYYY.MM.DD (ddd)");
    row1.getCell(3).style = valueStyle;
    row1.getCell(4).value = "날씨";
    row1.getCell(4).style = headerStyle;
    row1.getCell(5).value = callSheet.weather || "-";
    row1.getCell(5).style = valueStyle;
    row1.getCell(6).value = "기온";
    row1.getCell(6).style = headerStyle;
    row1.getCell(7).value = `${callSheet.tempMin || "-"} ~ ${callSheet.tempMax || "-"}`;
    row1.getCell(7).style = valueStyle;
    row1.getCell(8).value = "강수";
    row1.getCell(8).style = headerStyle;
    row1.getCell(9).value = callSheet.precipitation || "-";
    row1.getCell(9).style = valueStyle;
    mainSheet.mergeCells(`I${infoStartRow}:L${infoStartRow}`);

    // 행 2: 집합시간, 일출/일몰, Shooting, 촬영종료
    const row2 = mainSheet.getRow(infoStartRow + 1);
    row2.getCell(1).value = "";
    row2.getCell(1).style = headerStyle;
    row2.getCell(2).value = "집합시간";
    row2.getCell(2).style = headerStyle;
    row2.getCell(3).value = callSheet.crewCallTime || "-";
    row2.getCell(3).style = valueStyle;
    row2.getCell(4).value = "일출/일몰";
    row2.getCell(4).style = headerStyle;
    row2.getCell(5).value = `${callSheet.sunrise || "-"} / ${callSheet.sunset || "-"}`;
    row2.getCell(5).style = valueStyle;
    row2.getCell(6).value = "Shooting";
    row2.getCell(6).style = headerStyle;
    row2.getCell(7).value = shootingTimeStr;
    row2.getCell(7).style = valueStyle;
    row2.getCell(8).value = "촬영종료";
    row2.getCell(8).style = headerStyle;
    row2.getCell(9).value = shootingEndTime;
    row2.getCell(9).style = valueStyle;
    mainSheet.mergeCells(`I${infoStartRow + 1}:L${infoStartRow + 1}`);

    // 행 3: 촬영장소, 감독, 프로듀서, 조연출
    const row3 = mainSheet.getRow(infoStartRow + 2);
    row3.getCell(1).value = "";
    row3.getCell(1).style = headerStyle;
    row3.getCell(2).value = "촬영장소";
    row3.getCell(2).style = headerStyle;
    row3.getCell(3).value = callSheet.location || "-";
    row3.getCell(3).style = valueStyle;
    row3.getCell(4).value = "감독";
    row3.getCell(4).style = headerStyle;
    row3.getCell(5).value = callSheet.director || "-";
    row3.getCell(5).style = valueStyle;
    row3.getCell(6).value = "프로듀서";
    row3.getCell(6).style = headerStyle;
    row3.getCell(7).value = callSheet.producer || "-";
    row3.getCell(7).style = valueStyle;
    row3.getCell(8).value = "조연출";
    row3.getCell(8).style = headerStyle;
    row3.getCell(9).value = callSheet.adName || "-";
    row3.getCell(9).style = valueStyle;
    mainSheet.mergeCells(`I${infoStartRow + 2}:L${infoStartRow + 2}`);

    // 행 4: 집합장소
    const row4 = mainSheet.getRow(infoStartRow + 3);
    row4.getCell(1).value = "";
    row4.getCell(1).style = headerStyle;
    row4.getCell(2).value = "집합장소";
    row4.getCell(2).style = headerStyle;
    row4.getCell(3).value = callSheet.meetingPlace || "촬영장소와 동일";
    row4.getCell(3).style = valueStyle;
    mainSheet.mergeCells(`C${infoStartRow + 3}:L${infoStartRow + 3}`);

    // 행 5: 주소
    const row5 = mainSheet.getRow(infoStartRow + 4);
    row5.getCell(1).value = "";
    row5.getCell(1).style = headerStyle;
    row5.getCell(2).value = "주소";
    row5.getCell(2).style = headerStyle;
    row5.getCell(3).value = callSheet.address || "-";
    row5.getCell(3).style = valueStyle;
    mainSheet.mergeCells(`C${infoStartRow + 4}:L${infoStartRow + 4}`);

    // 빈 행
    mainSheet.getRow(infoStartRow + 5);

    // 씬 테이블 섹션 제목
    const scenesTitleRow = mainSheet.getRow(infoStartRow + 6);
    scenesTitleRow.getCell(1).value = "촬영 씬";
    scenesTitleRow.getCell(1).font = { bold: true, size: 11 };

    // 씬 테이블 헤더 (PDF와 동일한 순서)
    const scenesHeaderRow = mainSheet.getRow(infoStartRow + 7);
    const headers = ["#", "S#", "CUT", "M/D/E/N", "시작", "소요", "끝", "I/E", "장소", "촬영내용", "출연진", "비고"];
    headers.forEach((header, idx) => {
      const cell = scenesHeaderRow.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
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
      const endTime = calculateEndTime(scene.startTime, scene.estimatedTime);
      const row = mainSheet.getRow(infoStartRow + 8 + index);
      const values = [
        index + 1,
        scene.sceneNumber?.replace("S#", "") || "",
        scene.pages || "", // CUT (pages 필드 사용)
        scene.dayNight || "",
        scene.startTime || "",
        scene.estimatedTime ? `${scene.estimatedTime}` : "",
        endTime,
        scene.locationType === "INT" ? "I" : scene.locationType === "EXT" ? "E" : scene.locationType === "INT/EXT" ? "I/E" : "",
        scene.locationName || "",
        scene.description || "",
        scene.cast || "",
        scene.notes || "",
      ];
      values.forEach((value, idx) => {
        const cell = row.getCell(idx + 1);
        cell.value = value;
        cell.font = { size: 9 };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", wrapText: true, horizontal: idx < 8 ? "center" : "left" };
      });
    });

    // 컬럼 너비 설정
    mainSheet.columns = [
      { width: 5 },   // #
      { width: 6 },   // S#
      { width: 6 },   // CUT
      { width: 8 },   // M/D/E/N
      { width: 7 },   // 시작
      { width: 6 },   // 소요
      { width: 7 },   // 끝
      { width: 5 },   // I/E
      { width: 15 },  // 장소
      { width: 25 },  // 촬영내용
      { width: 15 },  // 출연진
      { width: 20 },  // 비고
    ];

    // 공지사항 (있는 경우)
    if (callSheet.generalNotes) {
      const notesRow = mainSheet.rowCount + 2;
      mainSheet.getRow(notesRow).getCell(1).value = "공지사항";
      mainSheet.getRow(notesRow).getCell(1).font = { bold: true, size: 11 };
      
      const notesContentRow = notesRow + 1;
      mainSheet.mergeCells(`A${notesContentRow}:L${notesContentRow}`);
      const notesCell = mainSheet.getRow(notesContentRow).getCell(1);
      notesCell.value = callSheet.generalNotes;
      notesCell.alignment = { wrapText: true };
      notesCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // === 두 번째 시트: 상세 정보 ===
    const hasSchedules = callSheet.schedules && callSheet.schedules.length > 0;
    const hasStaff = callSheet.staffList && callSheet.staffList.length > 0;
    const hasCast = callSheet.castMembers && callSheet.castMembers.length > 0;
    const hasDetails = callSheet.detailDirection || callSheet.detailAssistDir || 
                       callSheet.detailCamera || callSheet.detailLighting ||
                       callSheet.detailSound || callSheet.detailArt ||
                       callSheet.detailWardrobe || callSheet.detailProduction ||
                       callSheet.detailEtc;

    if (hasSchedules || hasStaff || hasCast || hasDetails) {
      const detailSheet = workbook.addWorksheet("상세정보", {
        pageSetup: {
          orientation: "landscape",
          paperSize: 9,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });

      // 제목
      detailSheet.mergeCells("A1:L1");
      detailSheet.getCell("A1").value = `< ${projectTitle} > ${callSheet.shootingDay}회차 - 상세 정보`;
      detailSheet.getCell("A1").font = { bold: true, size: 16 };
      detailSheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
      detailSheet.getRow(1).height = 30;

      let currentRow = 3;

      // 전체 일정
      if (hasSchedules) {
        detailSheet.getRow(currentRow).getCell(1).value = "전체일정";
        detailSheet.getRow(currentRow).getCell(1).font = { bold: true, size: 11 };
        currentRow++;

        // 헤더
        const scheduleHeaders = ["시간", "내용"];
        scheduleHeaders.forEach((header, idx) => {
          const cell = detailSheet.getRow(currentRow).getCell(idx + 1);
          cell.value = header;
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        currentRow++;

        callSheet.schedules!.forEach((schedule) => {
          const row = detailSheet.getRow(currentRow);
          row.getCell(1).value = schedule.time || "";
          row.getCell(2).value = schedule.content || "";
          [1, 2].forEach(idx => {
            const cell = row.getCell(idx);
            cell.font = { size: 9 };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { vertical: "middle" };
          });
          currentRow++;
        });
        currentRow += 2;
      }

      // 스태프
      if (hasStaff) {
        detailSheet.getRow(currentRow).getCell(1).value = "스태프";
        detailSheet.getRow(currentRow).getCell(1).font = { bold: true, size: 11 };
        currentRow++;

        const staffHeaders = ["직책", "이름", "연락처"];
        staffHeaders.forEach((header, idx) => {
          const cell = detailSheet.getRow(currentRow).getCell(idx + 1);
          cell.value = header;
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        currentRow++;

        callSheet.staffList!.forEach((staff) => {
          const row = detailSheet.getRow(currentRow);
          row.getCell(1).value = staff.position || "";
          row.getCell(2).value = staff.name || "";
          row.getCell(3).value = staff.contact || "";
          [1, 2, 3].forEach(idx => {
            const cell = row.getCell(idx);
            cell.font = { size: 9 };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { vertical: "middle" };
          });
          currentRow++;
        });
        currentRow += 2;
      }

      // 세부진행
      if (hasDetails) {
        detailSheet.getRow(currentRow).getCell(1).value = "세부진행";
        detailSheet.getRow(currentRow).getCell(1).font = { bold: true, size: 11 };
        currentRow++;

        const details = [
          { label: "연출", value: callSheet.detailDirection },
          { label: "조연출", value: callSheet.detailAssistDir },
          { label: "촬영/관련장비", value: callSheet.detailCamera },
          { label: "조명", value: callSheet.detailLighting },
          { label: "음향", value: callSheet.detailSound },
          { label: "미술", value: callSheet.detailArt },
          { label: "의상", value: callSheet.detailWardrobe },
          { label: "제작", value: callSheet.detailProduction },
          { label: "기타", value: callSheet.detailEtc },
        ];

        details.forEach((detail) => {
          if (detail.value) {
            const row = detailSheet.getRow(currentRow);
            row.getCell(1).value = detail.label;
            row.getCell(1).font = { bold: true, size: 9 };
            row.getCell(1).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            row.getCell(2).value = detail.value;
            row.getCell(2).font = { size: 9 };
            row.getCell(2).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            row.getCell(2).alignment = { wrapText: true };
            detailSheet.mergeCells(`B${currentRow}:F${currentRow}`);
            currentRow++;
          }
        });
        currentRow += 2;
      }

      // 캐스트리스트
      if (hasCast) {
        detailSheet.getRow(currentRow).getCell(1).value = "캐스트리스트 및 배우집합";
        detailSheet.getRow(currentRow).getCell(1).font = { bold: true, size: 11 };
        currentRow++;

        const castHeaders = ["배역", "연기자", "집합시간", "집합위치", "등장면", "배우 준비 의상/소품", "연락처"];
        castHeaders.forEach((header, idx) => {
          const cell = detailSheet.getRow(currentRow).getCell(idx + 1);
          cell.value = header;
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        currentRow++;

        callSheet.castMembers!.forEach((cast) => {
          const row = detailSheet.getRow(currentRow);
          row.getCell(1).value = cast.role || "";
          row.getCell(2).value = cast.actorName || "";
          row.getCell(3).value = cast.callTime || "";
          row.getCell(4).value = cast.callLocation || "";
          row.getCell(5).value = cast.scenes || "";
          row.getCell(6).value = cast.preparation || "";
          row.getCell(7).value = cast.contact || "";
          [1, 2, 3, 4, 5, 6, 7].forEach(idx => {
            const cell = row.getCell(idx);
            cell.font = { size: 9 };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            cell.alignment = { vertical: "middle", wrapText: true };
          });
          currentRow++;
        });
      }

      // 컬럼 너비
      detailSheet.columns = [
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 25 },
        { width: 15 },
      ];
    }

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 파일명 생성 (PDF와 동일한 형식)
    const filename = `[${projectTitle}]_일촬표_${callSheet.shootingDay}회차.xlsx`;
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
