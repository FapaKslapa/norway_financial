"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { Folder, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type GroupListCardProps = {
  groups: GroupItem[];
  selectedGroupId: string | undefined;
  onSelectGroup: (group: GroupItem) => void;
  onClearFriend: () => void;
  onOpenCreateGroup: () => void;
};

export function GroupListCard({
  groups,
  selectedGroupId,
  onSelectGroup,
  onClearFriend,
  onOpenCreateGroup,
}: GroupListCardProps) {
  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-5 rounded-[2rem]">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-(--card-border) mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <Folder size={15} />
          </div>
          <span className="font-bold text-xs">Le mie Cartelle</span>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 border-0 rounded-xl cursor-pointer flex items-center justify-center"
          onPress={onOpenCreateGroup}
        >
          <FolderPlus size={14} />
        </Button>
      </div>

      <CardContent className="p-0 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <span className="text-[10px] text-(--text-muted) font-semibold pl-1 py-1">
            Nessuna cartella creata. Dividi le spese con più amici creando un
            gruppo.
          </span>
        ) : (
          groups.map((group) => {
            const isSelected = selectedGroupId === group.id;
            return (
              <button
                type="button"
                key={group.id}
                onClick={() => {
                  onSelectGroup(group);
                  onClearFriend();
                }}
                className={cn(
                  "flex justify-between items-center px-3.5 py-3 rounded-2xl border transition-all cursor-pointer text-left w-full bg-transparent outline-none",
                  isSelected
                    ? "bg-blue-500 text-white border-transparent shadow-md shadow-blue-500/15"
                    : "bg-neutral-500/5 border-(--card-border) hover:bg-neutral-500/10 text-foreground",
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Folder
                    size={14}
                    className={isSelected ? "text-white" : "text-blue-500"}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate leading-none mb-0.5">
                      {group.name}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-semibold",
                        isSelected ? "text-white/85" : "text-(--text-muted)",
                      )}
                    >
                      {group.members.length} membri
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
