"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const hasRun = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const activateMutation = trpc.auth.activate.useMutation({
    onSuccess: () => setStatus("success"),
    onError: (err) => {
      setStatus("error");
      setErrorMessage(err.message);
    },
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Link non valido. Registrati di nuovo.");
      return;
    }
    activateMutation.mutate({ token, email });
  }, [token, email, activateMutation.mutate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[380px] bg-[var(--card-solid)] border border-[var(--card-border)] rounded-3xl p-8 shadow-[var(--card-shadow)] text-[var(--foreground)] flex flex-col items-center text-center gap-5"
      >
        <Image
          src="/logo.png"
          alt="Gravio"
          width={52}
          height={52}
          className="rounded-2xl"
        />
        <h1 className="text-xl font-bold tracking-tight">Gravio</h1>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 size={28} className="animate-spin text-blue-500" />
            <p className="text-xs text-[var(--text-muted)]">
              Attivazione in corso...
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h2 className="text-base font-bold mb-1">Account attivato!</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                Il tuo account è ora attivo. Accedi inserendo la tua email — ti
                invieremo un Magic Link.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login")}
              className="w-full h-11 bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs rounded-xl border-0 cursor-pointer hover:opacity-90 transition-all shadow-sm"
            >
              Vai al login
            </motion.button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
              <AlertCircle size={30} />
            </div>
            <div>
              <h2 className="text-base font-bold mb-1">Attivazione fallita</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                {errorMessage}
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/login")}
              className="w-full h-11 border border-[var(--card-border)] text-[var(--foreground)] font-semibold text-xs rounded-xl cursor-pointer hover:bg-neutral-500/10 transition-all bg-transparent"
            >
              Torna alla registrazione
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateContent />
    </Suspense>
  );
}
