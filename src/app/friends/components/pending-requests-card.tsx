"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { Check, Handshake, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type PendingUser = {
  id: string;
  name: string;
  email: string;
};

type PendingRequest = {
  id: string;
  user: PendingUser;
};

type PendingRequestsCardProps = {
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
  onActionSuccess: () => void;
};

export function PendingRequestsCard({
  incomingRequests,
  outgoingRequests,
  onActionSuccess,
}: PendingRequestsCardProps) {
  const respondRequestMutation = trpc.friend.respondRequest.useMutation({
    onSuccess: () => {
      onActionSuccess();
    },
  });

  const handleRespond = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    await respondRequestMutation.mutateAsync({ requestId, action });
  };

  const totalCount = incomingRequests.length + outgoingRequests.length;

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-5 rounded-[2rem]">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-(--card-border) mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
            <Handshake size={15} />
          </div>
          <span className="font-bold text-xs">Richieste Pendenti</span>
        </div>
        {totalCount > 0 && (
          <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        )}
      </div>

      <CardContent className="p-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider pl-1">
            Ricevute
          </span>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
            {incomingRequests.length === 0 ? (
              <span className="text-[10px] text-(--text-muted) font-semibold pl-1 py-1">
                Nessuna richiesta ricevuta
              </span>
            ) : (
              incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center p-2.5 rounded-2xl bg-neutral-500/5 border border-(--card-border) shrink-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate text-foreground">
                      {req.user.name}
                    </span>
                    <span className="text-[9px] text-(--text-muted) truncate">
                      {req.user.email}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/15 border-0 rounded-lg cursor-pointer flex items-center justify-center"
                      onPress={() => handleRespond(req.id, "accept")}
                      isDisabled={respondRequestMutation.isPending}
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/15 border-0 rounded-lg cursor-pointer flex items-center justify-center"
                      onPress={() => handleRespond(req.id, "decline")}
                      isDisabled={respondRequestMutation.isPending}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-(--card-border) pt-3">
          <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider pl-1">
            Inviate
          </span>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
            {outgoingRequests.length === 0 ? (
              <span className="text-[10px] text-(--text-muted) font-semibold pl-1 py-1">
                Nessuna richiesta inviata
              </span>
            ) : (
              outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center p-2.5 rounded-2xl bg-neutral-500/5 border border-(--card-border) opacity-85 shrink-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate text-foreground">
                      {req.user.name}
                    </span>
                    <span className="text-[9px] text-(--text-muted) truncate">
                      {req.user.email}
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded-lg shrink-0">
                    Pendente
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
