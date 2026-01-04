"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Schedule } from "~/types/call-sheet";

interface ScheduleTableProps {
  schedules: Schedule[];
  onChange: (schedules: Schedule[]) => void;
}

export function ScheduleTable({ schedules, onChange }: ScheduleTableProps) {
  const handleAdd = () => {
    const newSchedule: Schedule = {
      order: schedules.length + 1,
      time: "",
      content: "",
    };
    onChange([...schedules, newSchedule]);
  };

  const handleRemove = (index: number) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    onChange(newSchedules.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleChange = (index: number, field: keyof Schedule, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index]!, [field]: value };
    onChange(newSchedules);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">전체 일정</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>
      
      {schedules.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          일정을 추가해주세요
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 text-sm font-medium w-32">시간</th>
                <th className="text-left px-3 py-2 text-sm font-medium">내용</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => (
                <tr key={schedule.id || index} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Input
                      type="time"
                      value={schedule.time || ""}
                      onChange={(e) => handleChange(index, "time", e.target.value)}
                      placeholder="06:30"
                      className="h-8"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={schedule.content || ""}
                      onChange={(e) => handleChange(index, "content", e.target.value)}
                      placeholder="스태프 집합"
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
    </div>
  );
}

