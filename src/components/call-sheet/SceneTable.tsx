"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SceneRow } from "./SceneRow";
import type { Scene } from "~/types/call-sheet";

interface SceneTableProps {
  scenes: Scene[];
  onChange: (scenes: Scene[]) => void;
}

export function SceneTable({ scenes, onChange }: SceneTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = scenes.findIndex(
          (scene) => (scene.id || `scene-${scenes.indexOf(scene)}`) === active.id
        );
        const newIndex = scenes.findIndex(
          (scene) => (scene.id || `scene-${scenes.indexOf(scene)}`) === over.id
        );

        const newScenes = arrayMove(scenes, oldIndex, newIndex).map(
          (scene, index) => ({
            ...scene,
            order: index,
          })
        );

        onChange(newScenes);
      }
    },
    [scenes, onChange]
  );

  const handleSceneChange = useCallback(
    (index: number, field: keyof Scene, value: string | number | null) => {
      const newScenes = [...scenes];
      newScenes[index] = { ...newScenes[index], [field]: value };
      onChange(newScenes);
    },
    [scenes, onChange]
  );

  const handleDeleteScene = useCallback(
    (index: number) => {
      const newScenes = scenes
        .filter((_, i) => i !== index)
        .map((scene, i) => ({ ...scene, order: i }));
      onChange(newScenes);
    },
    [scenes, onChange]
  );

  const handleAddScene = useCallback(() => {
    const newScene: Scene = {
      order: scenes.length,
      sceneNumber: `S#${scenes.length + 1}`,
      description: null,
      locationType: null,
      locationName: null,
      dayNight: null,
      pages: null,
      estimatedTime: null,
      startTime: null,
      endTime: null,
      cast: null,
      extras: null,
      props: null,
      wardrobe: null,
      makeup: null,
      specialEquip: null,
      notes: null,
    };
    onChange([...scenes, newScene]);
  }, [scenes, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">촬영 씬 목록</h3>
        <Button onClick={handleAddScene} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          씬 추가
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="text-left text-xs text-muted-foreground whitespace-nowrap">
              <th className="w-[28px] min-w-[28px] p-1"></th>
              <th className="w-[28px] min-w-[28px] p-1 text-center">#</th>
              <th className="w-[52px] min-w-[52px] p-1">S#</th>
              <th className="w-[44px] min-w-[44px] p-1">Cut</th>
              <th className="w-[52px] min-w-[52px] p-1">M/D/E/N</th>
              <th className="w-[52px] min-w-[52px] p-1">시작</th>
              <th className="w-[56px] min-w-[56px] p-1">소요</th>
              <th className="w-[52px] min-w-[52px] p-1">끝</th>
              <th className="w-[64px] min-w-[64px] p-1">I/E</th>
              <th className="min-w-[80px] p-1">장소</th>
              <th className="min-w-[100px] p-1">촬영내용</th>
              <th className="min-w-[80px] p-1">출연진</th>
              <th className="min-w-[80px] p-1">비고</th>
              <th className="w-[28px] min-w-[28px] p-1"></th>
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={scenes.map((scene, index) => scene.id || `scene-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                {scenes.map((scene, index) => (
                  <SceneRow
                    key={scene.id || `scene-${index}`}
                    scene={scene}
                    index={index}
                    onChange={handleSceneChange}
                    onDelete={handleDeleteScene}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>

        {scenes.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>아직 씬이 없습니다.</p>
            <Button onClick={handleAddScene} variant="link" className="mt-2">
              첫 씬 추가하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

