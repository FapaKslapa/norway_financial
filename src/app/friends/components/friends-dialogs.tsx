"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: { id: string; name: string; email: string }[];
};

interface FriendsDialogsProps {
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

export function FriendsDialogs({
  friendToDelete,
  onCloseFriendDelete,
  onConfirmFriendDelete,
  settleConfirmFriend,
  onCloseSettle,
  onConfirmSettle,
  groupToDelete,
  onCloseGroupDelete,
  onConfirmGroupDelete,
}: FriendsDialogsProps) {
  return (
    <>
      <ConfirmationDialog
        isOpen={friendToDelete !== null}
        onClose={onCloseFriendDelete}
        onConfirm={onConfirmFriendDelete}
        title="Rimuovi Amico"
        message={`Sei sicuro di voler rimuovere ${friendToDelete?.user.name} dai tuoi amici? Questo non cancellerà le transazioni passate ma non potrete più condividere nuove spese.`}
        confirmLabel="Rimuovi"
        cancelLabel="Annulla"
        isDestructive={true}
      />

      <ConfirmationDialog
        isOpen={settleConfirmFriend !== null}
        onClose={onCloseSettle}
        onConfirm={onConfirmSettle}
        title="Conferma Saldo"
        message={`Sei sicuro di voler saldare il debito con ${settleConfirmFriend?.user.name}? Verrà registrata una transazione di saldo.`}
        confirmLabel="Salda"
        cancelLabel="Annulla"
        isDestructive={false}
      />

      <ConfirmationDialog
        isOpen={groupToDelete !== null}
        onClose={onCloseGroupDelete}
        onConfirm={onConfirmGroupDelete}
        title="Elimina Cartella"
        message={`Sei sicuro di voler eliminare la cartella "${groupToDelete?.name}"? I membri ed i bilanci storici rimarranno intatti, ma il gruppo verrà rimosso.`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        isDestructive={true}
      />
    </>
  );
}
