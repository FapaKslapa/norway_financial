"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { gsap } from "gsap";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Moon,
  Sun,
  User,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power4.out",
          delay: 0.1,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-background px-4 select-none transition-colors duration-500"
    >
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Cambia tema"
          className="w-9 h-9 bg-(--card-solid) border border-(--card-border) shadow-sm hover:scale-105 active:scale-95 transition-all text-foreground rounded-full flex items-center justify-center cursor-pointer"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div ref={cardRef} className="w-full max-w-[400px] z-10">
        <div className="w-full border border-(--card-border) bg-(--card-solid) shadow-(--card-shadow) py-8 px-6 rounded-3xl text-foreground transition-all duration-300">
          <div className="flex flex-col gap-2 items-center justify-center pb-6">
            <Image
              src="/logo.png"
              alt="Gravio"
              width={56}
              height={56}
              className="rounded-2xl mb-2"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gravio
            </h1>
            <p className="text-xs text-(--text-muted) text-center font-normal max-w-[280px]">
              Gestisci le tue finanze personali in qualsiasi valuta.
            </p>
          </div>

          <div className="relative flex p-1 bg-neutral-500/5 border border-(--card-border) rounded-xl mb-6">
            <m.div
              className="absolute top-1 bottom-1 rounded-lg bg-(--card-solid) shadow-sm border border-(--card-border)"
              animate={{
                left: tab === "login" ? 4 : "calc(50%)",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 text-[11px] font-bold py-2 z-10 relative transition-colors cursor-pointer bg-transparent border-0 rounded-lg ${tab === "login" ? "text-foreground" : "text-(--text-muted)"}`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 text-[11px] font-bold py-2 z-10 relative transition-colors cursor-pointer bg-transparent border-0 rounded-lg ${tab === "register" ? "text-foreground" : "text-(--text-muted)"}`}
            >
              Registrati
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <m.div
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <LoginForm />
              </m.div>
            ) : (
              <m.div
                key="register"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <RegisterForm onSuccess={() => setTab("login")} />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      });
      if (authError) {
        setError(authError.message || "Qualcosa è andato storto. Riprova.");
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore di rete.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <m.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="flex flex-col items-center text-center py-4"
        >
          <m.div
            initial={{ scale: 0.95, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
            className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full mb-4"
          >
            <CheckCircle2 size={32} />
          </m.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Controlla la tua email
          </h3>
          <p className="text-xs text-(--text-muted) leading-relaxed mb-6 max-w-[260px]">
            Abbiamo inviato un link di accesso a{" "}
            <strong className="text-foreground">{email}</strong>. Controlla
            anche la cartella spam.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
            }}
            className="w-full py-2.5 text-xs font-semibold border border-(--card-border) text-foreground hover:bg-neutral-500/10 cursor-pointer rounded-xl bg-transparent transition-all"
          >
            Usa un'altra email
          </button>
        </m.div>
      ) : (
        <m.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[11px] text-(--text-muted) font-semibold tracking-wider uppercase ml-1"
            >
              Email
            </label>
            <div className="bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center gap-2 border border-(--card-border) focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <Mail size={15} className="text-(--text-muted) shrink-0" />
              <input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs placeholder:text-neutral-400 text-foreground flex-1 bg-transparent border-0 outline-none"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <m.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </m.div>
            )}
          </AnimatePresence>

          <m.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-1 w-full bg-foreground text-background font-semibold text-xs h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 rounded-xl border-0 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Invio...</span>
              </>
            ) : (
              <>
                <span>Accedi con Magic Link</span>
                <ArrowRight size={14} />
              </>
            )}
          </m.button>

          <p className="text-center text-[10px] text-(--text-muted) border-t border-(--card-border) pt-4 leading-relaxed">
            Riceverai un link via email. Nessuna password richiesta.
          </p>
        </m.form>
      )}
    </AnimatePresence>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const trpc = useTRPC();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => setIsSuccess(true),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    registerMutation.mutate({ name, email });
  };

  if (isSuccess) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="flex flex-col items-center text-center py-4"
      >
        <m.div
          initial={{ scale: 0.95, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
          className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full mb-4"
        >
          <CheckCircle2 size={32} />
        </m.div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Controlla la tua email
        </h3>
        <p className="text-xs text-(--text-muted) leading-relaxed mb-6 max-w-[260px]">
          Abbiamo inviato un link di attivazione a{" "}
          <strong className="text-foreground">{email}</strong>. Dopo
          l'attivazione potrai accedere con Magic Link.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-2.5 text-xs font-semibold bg-foreground text-background hover:opacity-90 cursor-pointer rounded-xl border-0 transition-all"
        >
          Vai al login
        </button>
      </m.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-name"
          className="text-[11px] text-(--text-muted) font-semibold tracking-wider uppercase ml-1"
        >
          Nome
        </label>
        <div className="bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center gap-2 border border-(--card-border) focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <User size={15} className="text-(--text-muted) shrink-0" />
          <input
            id="reg-name"
            type="text"
            placeholder="Mario Rossi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-xs placeholder:text-neutral-400 text-foreground flex-1 bg-transparent border-0 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="reg-email"
          className="text-[11px] text-(--text-muted) font-semibold tracking-wider uppercase ml-1"
        >
          Email
        </label>
        <div className="bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center gap-2 border border-(--card-border) focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <Mail size={15} className="text-(--text-muted) shrink-0" />
          <input
            id="reg-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-xs placeholder:text-neutral-400 text-foreground flex-1 bg-transparent border-0 outline-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {registerMutation.error && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{registerMutation.error.message}</span>
          </m.div>
        )}
      </AnimatePresence>

      <m.button
        type="submit"
        disabled={registerMutation.isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="mt-1 w-full bg-foreground text-background font-semibold text-xs h-11 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 rounded-xl border-0 disabled:opacity-50 transition-all"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            <span>Registrazione...</span>
          </>
        ) : (
          <>
            <span>Crea Account</span>
            <ArrowRight size={14} />
          </>
        )}
      </m.button>

      <p className="text-center text-[10px] text-(--text-muted) border-t border-(--card-border) pt-4 leading-relaxed">
        Riceverai un'email di attivazione. Nessuna password.
      </p>
    </form>
  );
}
