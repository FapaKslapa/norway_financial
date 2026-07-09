"use client";

import { CreateGroupModal } from "./create-group-modal";
import { FriendsDialogs } from "./friends-dialogs";
import {
  SharedExpenseDialog,
  type SharedExpensePayload,
} from "./shared-expense-dialog";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type GroupMember = { id: string; name: string; email: string };

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

interface FriendsModalsProps {
  // SharedExpenseDialog
  isSharedExpenseOpen: boolean;
  onCloseSharedExpense: () => void;
  friends: FriendItem[];
  groups: GroupItem[];
  selectedGroup: GroupItem | null;
  selectedFriend: FriendItem | null;
  onSaveSharedExpense: (payload: SharedExpensePayload) => Promise<void>;
  onSaveGroupExpense: (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
    groupId: string;
    groupSplits: Array<{ userId: string; amountNok: number }>;
  }) => Promise<void>;

  // CreateGroupModal
  isCreateGroupOpen: boolean;
  onCloseCreateGroup: () => void;
  onCreateGroupSuccess: () => void;

  // FriendsDialogs (confirmations)
  friendToDelete: FriendItem | null;
  onCloseFriendDelete: () => void;
  onConfirmFriendDelete: () => Promise<void>;
  settleConfirmFriend: FriendItem | null;
  onCloseSettle: () => void;
  onConfirmSettle: () => Promise<void>;
  groupToDelete: GroupItem | null;
  onCloseGroupDelete: () => void;
  onConfirmGroupDelete: () => Promise<void>;
}

export function FriendsModals({
  isSharedExpenseOpen,
  onCloseSharedExpense,
  friends,
  groups,
  selectedGroup,
  selectedFriend,
  onSaveSharedExpense,
  onSaveGroupExpense,
  isCreateGroupOpen,
  onCloseCreateGroup,
  onCreateGroupSuccess,
  friendToDelete,
  onCloseFriendDelete,
  onConfirmFriendDelete,
  settleConfirmFriend,
  onCloseSettle,
  onConfirmSettle,
  groupToDelete,
  onCloseGroupDelete,
  onConfirmGroupDelete,
}: FriendsModalsProps) {
  return (
    <>
      <SharedExpenseDialog
        isOpen={isSharedExpenseOpen}
        onClose={onCloseSharedExpense}
        friends={friends.map((f) => ({ user: { id: f.user.id, name: f.user.name } }))}
        groups={groups}
        onSave={onSaveSharedExpense}
        onSaveGroupExpense={onSaveGroupExpense}
        defaultGroupId={selectedGroup?.id}
        defaultFriendId={selectedFriend?.user.id}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={onCloseCreateGroup}
        friends={friends}
        onSuccess={onCreateGroupSuccess}
      />

      <FriendsDialogs
        friendToDelete={friendToDelete}
        onCloseFriendDelete={onCloseFriendDelete}
        onConfirmFriendDelete={onConfirmFriendDelete}
        settleConfirmFriend={settleConfirmFriend}
        onCloseSettle={onCloseSettle}
        onConfirmSettle={onConfirmSettle}
        groupToDelete={groupToDelete}
        onCloseGroupDelete={onCloseGroupDelete}
        onConfirmGroupDelete={onConfirmGroupDelete}
      />
    </>
  );
}
