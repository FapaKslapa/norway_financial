"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FolderPlus, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type FriendUser = {
  id: string;
  name: string;
  email: string;
};

type FriendItem = {
  friendshipId: string;
  user: FriendUser;
};

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendItem[];
  onSuccess: () => void;
};

export function CreateGroupModal({
  isOpen,
  onClose,
  friends,
  onSuccess,
}: CreateGroupModalProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<
    string[]
  >([]);

  const createGroupMutation = trpc.group.create.useMutation({
    onSuccess: () => {
      onSuccess();
      setNewGroupName("");
      setSelectedGroupMemberIds([]);
      onClose();
    },
  });

  const handleToggleMemberSelection = (friendId: string) => {
    setSelectedGroupMemberIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await createGroupMutation.mutateAsync({
      name: newGroupName.trim(),
      memberUserIds: selectedGroupMemberIds,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-(--card-solid) border border-(--card-border) w-full max-w-[420px] rounded-3xl p-6 shadow-2xl text-foreground z-10 flex flex-col max-h-[85vh]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-(--card-border) mb-4 shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <FolderPlus size={16} className="text-blue-500" />
                Crea Nuova Cartella (Gruppo)
              </h3>
              <Button
                isIconOnly
                variant="ghost"
                className="text-(--text-muted) rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer flex items-center justify-center"
                onPress={onClose}
              >
                <X size={15} />
              </Button>
            </div>

            <form
              onSubmit={handleCreateGroup}
              className="flex flex-col gap-4 flex-1 overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 shrink-0">
                <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
                  Nome della Cartella
                </span>
                <div className="bg-neutral-100 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800/50 focus-within:border-blue-500/50 h-11 px-3 rounded-2xl flex items-center w-full transition-all">
                  <input
                    type="text"
                    placeholder="Es. Spese Convivenza, Festa Compleanno..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    className="text-xs text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted) min-w-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1 select-none">
                  Seleziona Amici
                </span>
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[200px]">
                  {friends.length === 0 ? (
                    <span className="text-[10px] text-(--text-muted) font-semibold p-1">
                      Devi aggiungere amici prima di poter creare una cartella.
                    </span>
                  ) : (
                    friends.map((friend) => {
                      const checked = selectedGroupMemberIds.includes(
                        friend.user.id,
                      );
                      return (
                        <button
                          key={friend.user.id}
                          type="button"
                          onClick={() =>
                            handleToggleMemberSelection(friend.user.id)
                          }
                          className={cn(
                            "flex items-center gap-3.5 p-2.5 rounded-2xl border transition-all cursor-pointer text-left bg-transparent",
                            checked
                              ? "border-blue-500/30 bg-blue-500/5 text-foreground"
                              : "border-(--card-border) hover:bg-neutral-500/5 text-foreground",
                          )}
                        >
                          <div
                            className={cn(
                              "h-5 w-5 rounded-md flex items-center justify-center border transition-all shrink-0",
                              checked
                                ? "bg-blue-500 border-transparent text-white"
                                : "border-(--card-border) text-transparent",
                            )}
                          >
                            <Check size={12} className="stroke-[3]" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate leading-none mb-0.5">
                              {friend.user.name}
                            </span>
                            <span className="text-[8px] text-(--text-muted) truncate">
                              {friend.user.email}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border-t border-(--card-border) pt-4 mt-1 flex justify-end gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 text-xs font-bold text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-xl cursor-pointer flex-1"
                  onPress={onClose}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  isDisabled={
                    createGroupMutation.isPending || !newGroupName.trim()
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs h-10 rounded-xl cursor-pointer shadow-sm border-0 flex-1 disabled:opacity-50 flex items-center justify-center"
                >
                  {createGroupMutation.isPending
                    ? "Creazione..."
                    : "Crea Cartella"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
