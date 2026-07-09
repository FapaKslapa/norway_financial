"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { AddFriendCard } from "./add-friend-card";
import { GroupListCard } from "./group-list-card";
import { PendingRequestsCard } from "./pending-requests-card";

type GroupMember = { id: string; name: string; email: string };

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

interface FriendsLeftColumnProps {
  activeMobileTab: "friends" | "groups" | "manage";
  isSelecting: boolean;
  pendingIncoming: Array<{
    id: string;
    user: { id: string; name: string; email: string; image: string | null } | null;
    createdAt: Date | null;
  }>;
  pendingOutgoing: Array<{
    id: string;
    user: { id: string; name: string; email: string; image: string | null } | null;
    createdAt: Date | null;
  }>;
  groups: GroupItem[];
  selectedGroupId: string | undefined;
  onAddFriendSuccess: () => void;
  onPendingActionSuccess: () => void;
  onSelectGroup: (group: GroupItem) => void;
  onClearFriend: () => void;
  onOpenCreateGroup: () => void;
}


export function FriendsLeftColumn({
  activeMobileTab,
  isSelecting,
  pendingIncoming,
  pendingOutgoing,
  groups,
  selectedGroupId,
  onAddFriendSuccess,
  onPendingActionSuccess,
  onSelectGroup,
  onClearFriend,
  onOpenCreateGroup,
}: FriendsLeftColumnProps) {
  return (
    <div
      className={cn(
        "order-2 md:order-1 md:col-span-1 flex flex-col gap-6",
        isSelecting && "hidden md:flex",
      )}
    >
      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className={cn(activeMobileTab !== "manage" && "hidden md:block")}
      >
        <AddFriendCard onSuccess={onAddFriendSuccess} />
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
        className={cn(activeMobileTab !== "manage" && "hidden md:block")}
      >
        <PendingRequestsCard
          incomingRequests={pendingIncoming.filter(
            (r): r is typeof r & { user: NonNullable<typeof r.user> } => r.user !== null,
          )}
          outgoingRequests={pendingOutgoing.filter(
            (r): r is typeof r & { user: NonNullable<typeof r.user> } => r.user !== null,
          )}
          onActionSuccess={onPendingActionSuccess}
        />
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(activeMobileTab !== "groups" && "hidden md:block")}
      >
        <GroupListCard
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={onSelectGroup}
          onClearFriend={onClearFriend}
          onOpenCreateGroup={onOpenCreateGroup}
        />
      </m.div>
    </div>
  );
}
