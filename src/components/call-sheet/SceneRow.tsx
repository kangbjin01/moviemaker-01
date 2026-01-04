"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Scene } from "~/types/call-sheet";

interface SceneRowProps {
  scene: Scene;
  index: number;
  onChange: (index: number, field: keyof Scene, value: string | number | null) => void;
  onDelete: (index: number) => void;
}

// 시작시간 + 소요시간 = 끝시간 계산
function calculateEndTime(startTime: string | null | undefined, estimatedTime: number | null | undefined): string {
  if (!startTime || !estimatedTime) return "";
  
  const [hours, minutes] = startTime.split(":").map(Number);
  if (isNaN(hours!) || isNaN(minutes!)) return "";
  
  const totalMinutes = hours! * 60 + minutes! + estimatedTime;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export function SceneRow({ scene, index, onChange, onDelete }: SceneRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id || `scene-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 끝 시간 자동 계산
  const calculatedEndTime = useMemo(() => {
    return calculateEndTime(scene.startTime, scene.estimatedTime);
  }, [scene.startTime, scene.estimatedTime]);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      {/* 드래그 핸들 */}
      <td className="w-[28px] min-w-[28px] p-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </td>

      {/* 순서 */}
      <td className="w-[28px] min-w-[28px] p-1 text-center text-xs text-muted-foreground">
        {index + 1}
      </td>

      {/* 씬 번호 */}
      <td className="w-[52px] min-w-[52px] p-1">
        <Input
          value={scene.sceneNumber}
          onChange={(e) => onChange(index, "sceneNumber", e.target.value)}
          placeholder="S#1"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* Cut */}
      <td className="w-[44px] min-w-[44px] p-1">
        <Input
          value={scene.pages || ""}
          onChange={(e) => onChange(index, "pages", e.target.value || null)}
          placeholder="C1"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* M/D/E/N */}
      <td className="w-[52px] min-w-[52px] p-1">
        <Select
          value={scene.dayNight || ""}
          onValueChange={(value) => onChange(index, "dayNight", value || null)}
        >
          <SelectTrigger className="h-7 text-xs px-1.5">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">M</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="E">E</SelectItem>
            <SelectItem value="N">N</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* 시작 시간 */}
      <td className="w-[52px] min-w-[52px] p-1">
        <Input
          type="time"
          value={scene.startTime || ""}
          onChange={(e) => onChange(index, "startTime", e.target.value || null)}
          className="h-7 text-xs px-1 time-input-24h"
        />
      </td>

      {/* 소요 시간 (분) */}
      <td className="w-[56px] min-w-[56px] p-1">
        <Input
          type="number"
          value={scene.estimatedTime || ""}
          onChange={(e) =>
            onChange(index, "estimatedTime", e.target.value ? parseInt(e.target.value) : null)
          }
          placeholder="분"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* 끝 시간 (자동 계산) */}
      <td className="w-[52px] min-w-[52px] p-1">
        <Input
          value={calculatedEndTime}
          readOnly
          className="h-7 text-xs px-1.5 bg-muted/50"
          placeholder="--:--"
        />
      </td>

      {/* INT/EXT */}
      <td className="w-[64px] min-w-[64px] p-1">
        <Select
          value={scene.locationType || ""}
          onValueChange={(value) => onChange(index, "locationType", value || null)}
        >
          <SelectTrigger className="h-7 text-xs px-1.5">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INT">INT</SelectItem>
            <SelectItem value="EXT">EXT</SelectItem>
            <SelectItem value="INT/EXT">I/E</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* 장소 */}
      <td className="min-w-[80px] p-1">
        <Input
          value={scene.locationName || ""}
          onChange={(e) => onChange(index, "locationName", e.target.value || null)}
          placeholder="장소명"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* 촬영 내용 */}
      <td className="min-w-[100px] p-1">
        <Input
          value={scene.description || ""}
          onChange={(e) => onChange(index, "description", e.target.value || null)}
          placeholder="촬영 내용"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* 출연진 */}
      <td className="min-w-[80px] p-1">
        <Input
          value={scene.cast || ""}
          onChange={(e) => onChange(index, "cast", e.target.value || null)}
          placeholder="출연진"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* 비고 */}
      <td className="min-w-[80px] p-1">
        <Input
          value={scene.notes || ""}
          onChange={(e) => onChange(index, "notes", e.target.value || null)}
          placeholder="비고"
          className="h-7 text-xs px-1.5"
        />
      </td>

      {/* 삭제 버튼 */}
      <td className="w-[28px] min-w-[28px] p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(index)}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}
