"use client";

import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface DetailedProgressFormProps {
  values: {
    detailDirection?: string | null;
    detailAssistDir?: string | null;
    detailLighting?: string | null;
    detailWardrobe?: string | null;
    detailSound?: string | null;
    detailProduction?: string | null;
    detailArt?: string | null;
    detailCamera?: string | null;
    detailEtc?: string | null;
  };
  onChange: (field: string, value: string) => void;
}

export function DetailedProgressForm({ values, onChange }: DetailedProgressFormProps) {
  const fields = [
    { key: "detailDirection", label: "연출" },
    { key: "detailAssistDir", label: "조연출" },
    { key: "detailCamera", label: "촬영/관련 장비" },
    { key: "detailLighting", label: "조명" },
    { key: "detailSound", label: "음향" },
    { key: "detailArt", label: "미술" },
    { key: "detailWardrobe", label: "의상" },
    { key: "detailProduction", label: "제작" },
    { key: "detailEtc", label: "기타" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">세부 진행</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
            <Textarea
              id={key}
              value={(values as Record<string, string | null | undefined>)[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={`${label} 관련 메모`}
              rows={3}
              className="resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

