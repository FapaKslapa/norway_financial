"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

type AddFriendCardProps = {
  onSuccess: () => void;
};

export function AddFriendCard({ onSuccess }: AddFriendCardProps) {
  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const sendRequestMutation = trpc.friend.sendRequest.useMutation({
    onSuccess: () => {
      onSuccess();
      setEmailInput("");
      setSuccessMsg("Richiesta inviata con successo!");
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Impossibile inviare la richiesta.");
      setSuccessMsg("");
    },
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    await sendRequestMutation.mutateAsync({ email: emailInput.trim() });
  };

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-5 rounded-[2rem]">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-(--card-border) mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <UserPlus size={15} />
          </div>
          <span className="font-bold text-xs">Aggiungi Amico</span>
        </div>
      </div>

      <CardContent className="p-0">
        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
              Email dell&apos;Amico
            </span>
            <div className="flex gap-2 items-center">
              <div className="bg-neutral-100 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800/50 focus-within:border-blue-500/50 h-11 px-3 rounded-2xl flex items-center gap-2 flex-1 transition-all duration-300">
                <Mail size={13} className="text-(--text-muted) shrink-0" />
                <input
                  type="email"
                  placeholder="email@esempio.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="text-xs text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted) min-w-0"
                />
              </div>
              <Button
                type="submit"
                isIconOnly
                isDisabled={sendRequestMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white h-11 w-11 rounded-2xl cursor-pointer shadow-sm border-0 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
              >
                <UserPlus size={15} />
              </Button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-[10px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl text-center">
              {successMsg}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
