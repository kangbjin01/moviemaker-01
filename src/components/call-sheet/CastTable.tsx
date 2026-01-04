"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CastMember, ProjectCast } from "~/types/call-sheet";

interface CastTableProps {
  castMembers: CastMember[];
  onChange: (castMembers: CastMember[]) => void;
  projectId?: string;
}

export function CastTable({ castMembers, onChange, projectId }: CastTableProps) {
  const [projectCastPool, setProjectCastPool] = useState<ProjectCast[]>([]);

  // 프로젝트 캐스트 풀 불러오기
  useEffect(() => {
    if (!projectId) return;
    
    const fetchProjectCast = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/cast`);
        if (response.ok) {
          setProjectCastPool(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch project cast:", error);
      }
    };

    fetchProjectCast();
  }, [projectId]);

  const handleAdd = () => {
    const newCast: CastMember = {
      order: castMembers.length + 1,
      role: "",
      actorName: "",
      callTime: "",
      callLocation: "",
      scenes: "",
      preparation: "",
      contact: "",
    };
    onChange([...castMembers, newCast]);
  };

  const handleAddFromPool = (poolCast: ProjectCast) => {
    // 이미 추가된 배우인지 확인
    const exists = castMembers.some(
      c => c.actorName === poolCast.actorName && c.role === poolCast.role
    );
    if (exists) return;

    const newCast: CastMember = {
      order: castMembers.length + 1,
      role: poolCast.role,
      actorName: poolCast.actorName,
      contact: poolCast.contact || "",
      callTime: "",
      callLocation: "",
      scenes: "",
      preparation: "",
    };
    onChange([...castMembers, newCast]);
  };

  const handleRemove = (index: number) => {
    const newList = castMembers.filter((_, i) => i !== index);
    onChange(newList.map((c, i) => ({ ...c, order: i + 1 })));
  };

  const handleChange = (index: number, field: keyof CastMember, value: string) => {
    const newList = [...castMembers];
    newList[index] = { ...newList[index]!, [field]: value };
    onChange(newList);
  };

  // 아직 추가되지 않은 프로젝트 캐스트
  const availableCast = projectCastPool.filter(
    pc => !castMembers.some(c => c.actorName === pc.actorName && c.role === pc.role)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">캐스트리스트 및 배우 집합</h3>
        <div className="flex gap-2">
          {/* 프로젝트 배우에서 선택 */}
          {availableCast.length > 0 && (
            <Select onValueChange={(value) => {
              const cast = projectCastPool.find(c => c.id === value);
              if (cast) handleAddFromPool(cast);
            }}>
              <SelectTrigger className="w-[180px]">
                <UserPlus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="배우 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableCast.map((cast) => (
                  <SelectItem key={cast.id} value={cast.id!}>
                    {cast.actorName} ({cast.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            직접 추가
          </Button>
        </div>
      </div>
      
      {castMembers.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          {projectCastPool.length > 0 
            ? "프로젝트 배우에서 선택하거나 직접 추가해주세요"
            : "배우를 추가해주세요"}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 text-sm font-medium w-24">배역</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-24">연기자</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-20">집합시간</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-28">집합 위치</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-24">등장면</th>
                <th className="text-left px-3 py-2 text-sm font-medium">배우 준비 의상/소품</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-32">연락처</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {castMembers.map((cast, index) => (
                <tr key={cast.id || index} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Input
                      value={cast.role || ""}
                      onChange={(e) => handleChange(index, "role", e.target.value)}
                      placeholder="철수"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.actorName || ""}
                      onChange={(e) => handleChange(index, "actorName", e.target.value)}
                      placeholder="김배우"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.callTime || ""}
                      onChange={(e) => handleChange(index, "callTime", e.target.value)}
                      placeholder="08:00"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.callLocation || ""}
                      onChange={(e) => handleChange(index, "callLocation", e.target.value)}
                      placeholder="촬영장"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.scenes || ""}
                      onChange={(e) => handleChange(index, "scenes", e.target.value)}
                      placeholder="1, 3, 5"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.preparation || ""}
                      onChange={(e) => handleChange(index, "preparation", e.target.value)}
                      placeholder="정장, 시계"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={cast.contact || ""}
                      onChange={(e) => handleChange(index, "contact", e.target.value)}
                      placeholder="010-0000-0000"
                      className="h-8"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {projectCastPool.length === 0 && projectId && (
        <p className="text-xs text-muted-foreground">
          💡 프로젝트 설정에서 배우를 미리 등록하면 여기서 선택할 수 있습니다
        </p>
      )}
    </div>
  );
}
