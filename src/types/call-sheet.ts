// 프로젝트 상태
export type ProjectStatus = "PREP" | "SHOOTING" | "POST" | "COMPLETED";

// 프로젝트 타입
export type ProjectType = "영화" | "드라마" | "웹드라마" | "광고" | "뮤직비디오" | "기타";

// 프로젝트 스태프 (프로젝트 단위 관리)
export interface ProjectStaff {
  id?: string;
  projectId?: string;
  name: string;
  position: string;
  contact?: string | null;
}

// 프로젝트 캐스트 (프로젝트 단위 관리)
export interface ProjectCast {
  id?: string;
  projectId?: string;
  actorName: string;
  role: string;
  contact?: string | null;
}

export interface Project {
  id?: string;
  userId?: string;
  title: string;
  type?: ProjectType | string | null;
  productionCo?: string | null;
  director?: string | null;
  producer?: string | null;
  adName?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status: ProjectStatus;
  callSheets?: DailyCallSheet[];
  projectStaff?: ProjectStaff[];
  projectCast?: ProjectCast[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Scene {
  id?: string;
  order: number;
  sceneNumber: string;
  description?: string | null;
  locationType?: string | null;
  locationName?: string | null;
  dayNight?: string | null;
  pages?: string | null;
  estimatedTime?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  cast?: string | null;
  extras?: number | null;
  props?: string | null;
  wardrobe?: string | null;
  makeup?: string | null;
  specialEquip?: string | null;
  notes?: string | null;
}

// 전체 일정
export interface Schedule {
  id?: string;
  order: number;
  time?: string | null;
  content?: string | null;
}

// 스태프
export interface Staff {
  id?: string;
  order: number;
  position?: string | null;
  name?: string | null;
  contact?: string | null;
}

// 캐스트 멤버
export interface CastMember {
  id?: string;
  order: number;
  role?: string | null;           // 배역
  actorName?: string | null;      // 연기자
  callTime?: string | null;       // 집합시간
  callLocation?: string | null;   // 집합 위치
  scenes?: string | null;         // 등장면
  preparation?: string | null;    // 배우 준비 의상/소품
  contact?: string | null;        // 연락처
}

export interface DailyCallSheet {
  id?: string;
  projectId: string;
  project?: Project;
  episode?: string | null;
  shootingDay: number;
  date: string | Date;
  weather?: string | null;
  tempMin?: string | null;
  tempMax?: string | null;
  precipitation?: string | null;
  sunrise?: string | null;
  sunset?: string | null;
  director?: string | null;
  producer?: string | null;
  adName?: string | null;
  location?: string | null;
  address?: string | null;
  meetingPlace?: string | null;
  parkingInfo?: string | null;
  emergencyContact?: string | null;
  crewCallTime?: string | null;
  talentCallTime?: string | null;
  generalNotes?: string | null;
  
  // 세부 진행
  detailDirection?: string | null;    // 연출
  detailAssistDir?: string | null;    // 조연출
  detailLighting?: string | null;     // 조명
  detailWardrobe?: string | null;     // 의상
  detailSound?: string | null;        // 음향
  detailProduction?: string | null;   // 제작
  detailArt?: string | null;          // 미술
  detailCamera?: string | null;       // 촬영/관련 장비
  detailEtc?: string | null;          // 기타
  
  // 관계
  scenes: Scene[];
  schedules?: Schedule[];
  staffList?: Staff[];
  castMembers?: CastMember[];
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type ProjectFormData = Omit<Project, "id" | "userId" | "callSheets" | "createdAt" | "updatedAt">;
export type CallSheetFormData = Omit<DailyCallSheet, "id" | "project" | "createdAt" | "updatedAt">;
