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
import type { Staff, ProjectStaff } from "~/types/call-sheet";

interface StaffTableProps {
  staffList: Staff[];
  onChange: (staffList: Staff[]) => void;
  projectId?: string;
}

export function StaffTable({ staffList, onChange, projectId }: StaffTableProps) {
  const [projectStaffPool, setProjectStaffPool] = useState<ProjectStaff[]>([]);

  // 프로젝트 스태프 풀 불러오기
  useEffect(() => {
    if (!projectId) return;
    
    const fetchProjectStaff = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}/staff`);
        if (response.ok) {
          setProjectStaffPool(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch project staff:", error);
      }
    };

    fetchProjectStaff();
  }, [projectId]);

  const handleAdd = () => {
    const newStaff: Staff = {
      order: staffList.length + 1,
      position: "",
      name: "",
      contact: "",
    };
    onChange([...staffList, newStaff]);
  };

  const handleAddFromPool = (poolStaff: ProjectStaff) => {
    // 이미 추가된 스태프인지 확인
    const exists = staffList.some(
      s => s.name === poolStaff.name && s.position === poolStaff.position
    );
    if (exists) return;

    const newStaff: Staff = {
      order: staffList.length + 1,
      position: poolStaff.position,
      name: poolStaff.name,
      contact: poolStaff.contact || "",
    };
    onChange([...staffList, newStaff]);
  };

  const handleRemove = (index: number) => {
    const newList = staffList.filter((_, i) => i !== index);
    onChange(newList.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleChange = (index: number, field: keyof Staff, value: string) => {
    const newList = [...staffList];
    newList[index] = { ...newList[index]!, [field]: value };
    onChange(newList);
  };

  // 아직 추가되지 않은 프로젝트 스태프
  const availableStaff = projectStaffPool.filter(
    ps => !staffList.some(s => s.name === ps.name && s.position === ps.position)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">스태프</h3>
        <div className="flex gap-2">
          {/* 프로젝트 스태프에서 선택 */}
          {availableStaff.length > 0 && (
            <Select onValueChange={(value) => {
              const staff = projectStaffPool.find(s => s.id === value);
              if (staff) handleAddFromPool(staff);
            }}>
              <SelectTrigger className="w-[180px]">
                <UserPlus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="스태프 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id!}>
                    {staff.name} ({staff.position})
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
      
      {staffList.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          {projectStaffPool.length > 0 
            ? "프로젝트 스태프에서 선택하거나 직접 추가해주세요"
            : "스태프를 추가해주세요"}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 text-sm font-medium w-32">직책</th>
                <th className="text-left px-3 py-2 text-sm font-medium w-40">이름</th>
                <th className="text-left px-3 py-2 text-sm font-medium">연락처</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, index) => (
                <tr key={staff.id || index} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Input
                      value={staff.position || ""}
                      onChange={(e) => handleChange(index, "position", e.target.value)}
                      placeholder="촬영감독"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={staff.name || ""}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      placeholder="홍길동"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={staff.contact || ""}
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

      {projectStaffPool.length === 0 && projectId && (
        <p className="text-xs text-muted-foreground">
          💡 프로젝트 설정에서 스태프를 미리 등록하면 여기서 선택할 수 있습니다
        </p>
      )}
    </div>
  );
}
