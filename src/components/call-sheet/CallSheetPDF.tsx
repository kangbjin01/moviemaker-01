"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { DailyCallSheet, Project } from "~/types/call-sheet";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

// 한글 폰트 등록 (Spoqa Han Sans Neo)
Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 9,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 12,
  },
  // 기본 정보 테이블
  infoTable: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    borderBottom: "1px solid #333",
  },
  infoCell: {
    padding: 4,
    borderRight: "1px solid #333",
  },
  infoCellHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: 700,
  },
  // 섹션 타이틀
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    borderBottom: "2px solid #000",
    paddingBottom: 3,
  },
  // 테이블 공통
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    borderTop: "1px solid #333",
    borderLeft: "1px solid #333",
  },
  tableRow: {
    flexDirection: "row",
    borderLeft: "1px solid #333",
  },
  tableCell: {
    padding: 3,
    borderRight: "1px solid #333",
    borderBottom: "1px solid #333",
    fontSize: 8,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  // 공지사항
  notesBox: {
    border: "1px solid #333",
    padding: 8,
    marginBottom: 12,
    minHeight: 40,
  },
  // 양옆 레이아웃
  sideBySide: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  sideSection: {
    flex: 1,
  },
  // 세부 진행 그리드
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "33.33%",
    padding: 4,
    borderRight: "1px solid #333",
    borderBottom: "1px solid #333",
  },
  detailLabel: {
    fontWeight: 700,
    fontSize: 8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 8,
    minHeight: 30,
  },
});

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

interface CallSheetPDFProps {
  callSheet: DailyCallSheet;
  project: Project;
}

// PDF 문서 컴포넌트
function CallSheetPDFDocument({ callSheet, project }: CallSheetPDFProps) {
  // 총 촬영 시간 계산
  const totalShootingMinutes = callSheet.scenes?.reduce((acc, scene) => {
    return acc + (scene.estimatedTime || 0);
  }, 0) || 0;
  const totalHours = Math.floor(totalShootingMinutes / 60);
  const totalMinutes = totalShootingMinutes % 60;

  // 촬영 종료 시간 계산 (마지막 씬의 끝 시간)
  let shootingEndTime = "-";
  if (callSheet.scenes && callSheet.scenes.length > 0) {
    // 씬 중 가장 늦은 끝 시간 찾기
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

  // 전체 일정, 스태프, 캐스트 데이터 존재 여부
  const hasSchedules = callSheet.schedules && callSheet.schedules.length > 0;
  const hasStaff = callSheet.staffList && callSheet.staffList.length > 0;
  const hasCast = callSheet.castMembers && callSheet.castMembers.length > 0;
  const hasDetails = callSheet.detailDirection || callSheet.detailAssistDir || 
                     callSheet.detailCamera || callSheet.detailLighting ||
                     callSheet.detailSound || callSheet.detailArt ||
                     callSheet.detailWardrobe || callSheet.detailProduction ||
                     callSheet.detailEtc;
  
  const hasSecondPage = hasSchedules || hasStaff || hasCast || hasDetails;

  // 집합장소 표시 (비어있으면 "촬영장소와 동일")
  const meetingPlaceDisplay = callSheet.meetingPlace || "촬영장소와 동일";

  return (
    <Document>
      {/* 첫 번째 페이지: 기본 정보 + 촬영 씬 */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* 타이틀 - n회차 포함 */}
        <Text style={styles.title}>
          &lt; {project.title} &gt; 일일촬영계획표 - {callSheet.shootingDay}회차
        </Text>

        {/* 기본 정보 테이블 */}
        <View style={[styles.infoTable, { border: "1px solid #333" }]}>
          {/* 1행: 촬영일시, 날씨, 기온, 강수확률 */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text style={{ textAlign: "center" }}>{callSheet.shootingDay}회차</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>촬영일시</Text>
            </View>
            <View style={[styles.infoCell, { width: 95 }]}>
              <Text>{dayjs(callSheet.date).format("YYYY.MM.DD (ddd)")}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 35 }]}>
              <Text>날씨</Text>
            </View>
            <View style={[styles.infoCell, { width: 50 }]}>
              <Text>{callSheet.weather || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 35 }]}>
              <Text>기온</Text>
            </View>
            <View style={[styles.infoCell, { width: 75 }]}>
              <Text>{callSheet.tempMin || "-"} ~ {callSheet.tempMax || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 35 }]}>
              <Text>강수</Text>
            </View>
            <View style={[styles.infoCell, { width: 40, borderRight: 0 }]}>
              <Text>{callSheet.precipitation || "-"}</Text>
            </View>
          </View>
          {/* 2행: 집합시간, 일출/일몰, Shooting, 촬영종료 */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text></Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>집합시간</Text>
            </View>
            <View style={[styles.infoCell, { width: 50 }]}>
              <Text>{callSheet.crewCallTime || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>일출/일몰</Text>
            </View>
            <View style={[styles.infoCell, { width: 75 }]}>
              <Text>{callSheet.sunrise || "-"} / {callSheet.sunset || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text>Shooting</Text>
            </View>
            <View style={[styles.infoCell, { width: 50 }]}>
              <Text>{totalHours > 0 ? `${totalHours}h ` : ""}{totalMinutes}m</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text>촬영종료</Text>
            </View>
            <View style={[styles.infoCell, { width: 35, borderRight: 0 }]}>
              <Text>{shootingEndTime}</Text>
            </View>
          </View>
          {/* 3행: 촬영장소, 감독, 프로듀서, 조연출 */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text></Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>촬영장소</Text>
            </View>
            <View style={[styles.infoCell, { width: 105 }]}>
              <Text>{callSheet.location || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 35 }]}>
              <Text>감독</Text>
            </View>
            <View style={[styles.infoCell, { width: 65 }]}>
              <Text>{callSheet.director || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text>프로듀서</Text>
            </View>
            <View style={[styles.infoCell, { width: 55 }]}>
              <Text>{callSheet.producer || "-"}</Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 40 }]}>
              <Text>조연출</Text>
            </View>
            <View style={[styles.infoCell, { width: 65, borderRight: 0 }]}>
              <Text>{callSheet.adName || "-"}</Text>
            </View>
          </View>
          {/* 4행: 집합장소 */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text></Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>집합장소</Text>
            </View>
            <View style={[styles.infoCell, { flex: 1, borderRight: 0 }]}>
              <Text>{meetingPlaceDisplay}</Text>
            </View>
          </View>
          {/* 5행: 주소 */}
          <View style={[styles.infoRow, { borderBottom: 0 }]}>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 50 }]}>
              <Text></Text>
            </View>
            <View style={[styles.infoCell, styles.infoCellHeader, { width: 55 }]}>
              <Text>주소</Text>
            </View>
            <View style={[styles.infoCell, { flex: 1, borderRight: 0 }]}>
              <Text>{callSheet.address || "-"}</Text>
            </View>
          </View>
        </View>

        {/* 촬영 씬 섹션 */}
        <Text style={styles.sectionTitle}>촬영 씬</Text>
        <View style={styles.table}>
          {/* 테이블 헤더 */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
              <Text style={{ fontWeight: 700 }}>#</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
              <Text style={{ fontWeight: 700 }}>S#</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
              <Text style={{ fontWeight: 700 }}>CUT</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
              <Text style={{ fontWeight: 700 }}>M/D{"\n"}E/N</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
              <Text style={{ fontWeight: 700 }}>시작</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
              <Text style={{ fontWeight: 700 }}>소요</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
              <Text style={{ fontWeight: 700 }}>끝</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
              <Text style={{ fontWeight: 700 }}>I/E</Text>
            </View>
            <View style={[styles.tableCell, { width: 80 }]}>
              <Text style={{ fontWeight: 700 }}>장소</Text>
            </View>
            <View style={[styles.tableCell, { width: 120 }]}>
              <Text style={{ fontWeight: 700 }}>촬영내용</Text>
            </View>
            <View style={[styles.tableCell, { width: 70 }]}>
              <Text style={{ fontWeight: 700 }}>출연진</Text>
            </View>
            <View style={[styles.tableCell, { width: 80, borderRight: 0 }]}>
              <Text style={{ fontWeight: 700 }}>비고</Text>
            </View>
          </View>
          {/* 테이블 바디 */}
          {callSheet.scenes && callSheet.scenes.length > 0 ? (
            callSheet.scenes.map((scene, index) => {
              const endTime = calculateEndTime(scene.startTime, scene.estimatedTime);
              return (
                <View key={scene.id || index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
                    <Text>{scene.sceneNumber?.replace("S#", "") || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
                    <Text>{scene.pages || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
                    <Text>{scene.dayNight || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
                    <Text>{scene.startTime || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 30 }]}>
                    <Text>{scene.estimatedTime ? `${scene.estimatedTime}` : ""}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
                    <Text>{endTime}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellCenter, { width: 35 }]}>
                    <Text>
                      {scene.locationType === "INT" ? "I" : 
                       scene.locationType === "EXT" ? "E" : 
                       scene.locationType === "INT/EXT" ? "I/E" : ""}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <Text>{scene.locationName || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text>{scene.description || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <Text>{scene.cast || ""}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 80, borderRight: 0 }]}>
                    <Text>{scene.notes || ""}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, { width: "100%", textAlign: "center", padding: 20 }]}>
                <Text>등록된 씬이 없습니다</Text>
              </View>
            </View>
          )}
        </View>

        {/* 공지사항 */}
        {callSheet.generalNotes && (
          <>
            <Text style={styles.sectionTitle}>공지사항</Text>
            <View style={styles.notesBox}>
              <Text>{callSheet.generalNotes}</Text>
            </View>
          </>
        )}
      </Page>

      {/* 두 번째 페이지: 전체 일정, 스태프, 세부 진행, 캐스트리스트 */}
      {hasSecondPage && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.title}>
            &lt; {project.title} &gt; {callSheet.shootingDay}회차 - 상세 정보
          </Text>

          {/* 전체 일정 + 스태프 (양옆 배치) */}
          {(hasSchedules || hasStaff) && (
            <View style={styles.sideBySide}>
              {/* 전체 일정 */}
              <View style={styles.sideSection}>
                <Text style={styles.sectionTitle}>전체일정</Text>
                {hasSchedules ? (
                  <View style={{ border: "1px solid #333" }}>
                    <View style={styles.tableHeader}>
                      <View style={[styles.tableCell, { width: 60 }]}>
                        <Text style={{ fontWeight: 700 }}>일정</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1, borderRight: 0 }]}>
                        <Text style={{ fontWeight: 700 }}>내용</Text>
                      </View>
                    </View>
                    {callSheet.schedules!.map((schedule, index) => (
                      <View key={schedule.id || index} style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: 60 }]}>
                          <Text>{schedule.time || ""}</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1, borderRight: 0 }]}>
                          <Text>{schedule.content || ""}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ border: "1px solid #333", padding: 10 }}>
                    <Text style={{ fontSize: 8, color: "#666" }}>등록된 일정이 없습니다</Text>
                  </View>
                )}
              </View>

              {/* 스태프 */}
              <View style={styles.sideSection}>
                <Text style={styles.sectionTitle}>스태프</Text>
                {hasStaff ? (
                  <View style={{ border: "1px solid #333" }}>
                    <View style={styles.tableHeader}>
                      <View style={[styles.tableCell, { width: 80 }]}>
                        <Text style={{ fontWeight: 700 }}>직책</Text>
                      </View>
                      <View style={[styles.tableCell, { width: 80 }]}>
                        <Text style={{ fontWeight: 700 }}>이름</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1, borderRight: 0 }]}>
                        <Text style={{ fontWeight: 700 }}>연락처</Text>
                      </View>
                    </View>
                    {callSheet.staffList!.map((staff, index) => (
                      <View key={staff.id || index} style={styles.tableRow}>
                        <View style={[styles.tableCell, { width: 80 }]}>
                          <Text>{staff.position || ""}</Text>
                        </View>
                        <View style={[styles.tableCell, { width: 80 }]}>
                          <Text>{staff.name || ""}</Text>
                        </View>
                        <View style={[styles.tableCell, { flex: 1, borderRight: 0 }]}>
                          <Text>{staff.contact || ""}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ border: "1px solid #333", padding: 10 }}>
                    <Text style={{ fontSize: 8, color: "#666" }}>등록된 스태프가 없습니다</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 세부진행 */}
          {hasDetails && (
            <>
              <Text style={styles.sectionTitle}>세부진행</Text>
              <View style={[styles.table, { border: "1px solid #333", borderBottom: 0, borderRight: 0 }]}>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>연출</Text>
                    <Text style={styles.detailValue}>{callSheet.detailDirection || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>조연출</Text>
                    <Text style={styles.detailValue}>{callSheet.detailAssistDir || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>촬영/관련장비</Text>
                    <Text style={styles.detailValue}>{callSheet.detailCamera || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>조명</Text>
                    <Text style={styles.detailValue}>{callSheet.detailLighting || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>음향</Text>
                    <Text style={styles.detailValue}>{callSheet.detailSound || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>미술</Text>
                    <Text style={styles.detailValue}>{callSheet.detailArt || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>의상</Text>
                    <Text style={styles.detailValue}>{callSheet.detailWardrobe || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>제작</Text>
                    <Text style={styles.detailValue}>{callSheet.detailProduction || ""}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>기타</Text>
                    <Text style={styles.detailValue}>{callSheet.detailEtc || ""}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 캐스트리스트 및 배우집합 */}
          {hasCast && (
            <>
              <Text style={styles.sectionTitle}>캐스트리스트 및 배우집합</Text>
              <View style={[styles.table, { border: "1px solid #333" }]}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Text style={{ fontWeight: 700 }}>배역</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Text style={{ fontWeight: 700 }}>연기자</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 50 }]}>
                    <Text style={{ fontWeight: 700 }}>집합시간</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <Text style={{ fontWeight: 700 }}>집합위치</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Text style={{ fontWeight: 700 }}>등장면</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={{ fontWeight: 700 }}>배우 준비 의상/소품</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 90, borderRight: 0 }]}>
                    <Text style={{ fontWeight: 700 }}>연락처</Text>
                  </View>
                </View>
                {callSheet.castMembers!.map((cast, index) => (
                  <View key={cast.id || index} style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: 60 }]}>
                      <Text>{cast.role || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: 60 }]}>
                      <Text>{cast.actorName || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: 50 }]}>
                      <Text>{cast.callTime || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: 70 }]}>
                      <Text>{cast.callLocation || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: 60 }]}>
                      <Text>{cast.scenes || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text>{cast.preparation || ""}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: 90, borderRight: 0 }]}>
                      <Text>{cast.contact || ""}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </Page>
      )}
    </Document>
  );
}

// PDF 다운로드 함수
export async function generateCallSheetPDF(callSheet: DailyCallSheet, project: Project): Promise<Blob> {
  const doc = <CallSheetPDFDocument callSheet={callSheet} project={project} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

// PDF 다운로드 트리거 함수
export async function downloadCallSheetPDF(callSheet: DailyCallSheet, project: Project) {
  try {
    const blob = await generateCallSheetPDF(callSheet, project);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // 파일명 형식: [프로젝트명]_일촬표_n회차.pdf
    link.download = `[${project.title}]_일촬표_${callSheet.shootingDay}회차.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF 생성 실패:", error);
    throw error;
  }
}

export { CallSheetPDFDocument };
