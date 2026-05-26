"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Landmark,
  Loader2,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../components/theme-provider";
import { authClient } from "../../lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

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
      const errMsg =
        err instanceof Error
          ? err.message
          : "Errore di rete o server non raggiungibile.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-[var(--background)] px-4 select-none transition-colors duration-500"
    >
      <div className="absolute top-6 right-6 z-50">
        <Button
          isIconOnly
          variant="ghost"
          onPress={toggleTheme}
          className="bg-[var(--card-solid)] border border-[var(--card-border)] shadow-sm hover:scale-105 active:scale-95 transition-all text-[var(--foreground)] rounded-full"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>

      <div ref={cardRef} className="w-full max-w-[400px] z-10">
        <div className="w-full border border-[var(--card-border)] bg-[var(--card-solid)] shadow-[var(--card-shadow)] py-8 px-6 rounded-3xl text-[var(--foreground)] transition-all duration-300">
          <div className="flex flex-col gap-2 items-center justify-center pb-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 mb-2">
              <Landmark size={26} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] font-sans">
              Erasmus Finance
            </h1>
            <p className="text-xs text-[var(--text-muted)] text-center font-normal max-w-[280px]">
              Gestisci le tue finanze personali durante la tua avventura in
              Norvegia.
            </p>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="flex flex-col items-center text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      delay: 0.1,
                    }}
                    className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full mb-4"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Magic Link Inviato
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6 max-w-[260px]">
                    Siamo in modalità sviluppo. Controlla la{" "}
                    <strong className="text-[var(--foreground)] font-semibold">
                      console del server
                    </strong>{" "}
                    nel tuo terminale per cliccare sul link.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full py-2 text-xs font-semibold border-[var(--card-border)] text-[var(--foreground)] hover:bg-neutral-500/10 cursor-pointer rounded-xl"
                    onPress={() => setIsSuccess(false)}
                  >
                    Usa un'altra email
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-[11px] text-[var(--text-muted)] font-semibold tracking-wider uppercase ml-1"
                    >
                      Email
                    </label>
                    <div className="bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center gap-2 border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all duration-300">
                      <Mail
                        size={15}
                        className="text-[var(--text-muted)] flex-shrink-0"
                      />
                      <input
                        id="email"
                        type="email"
                        placeholder="studente@erasmus.no"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="text-xs placeholder:text-neutral-400 text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full h-full"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs leading-relaxed"
                      >
                        <AlertCircle
                          size={15}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-2"
                  >
                    <Button
                      type="submit"
                      className="w-full bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 rounded-xl"
                      isDisabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            className="animate-spin text-[var(--background)]"
                            size={15}
                          />
                          <span>Verifica in corso...</span>
                        </>
                      ) : (
                        <>
                          <span>Accedi con Magic Link</span>
                          <ArrowRight
                            size={14}
                            className="text-[var(--background)]"
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-center text-[10px] text-[var(--text-muted)] mt-4 border-t border-[var(--card-border)] pt-4 leading-relaxed max-w-[280px] mx-auto">
                    Un link di accesso istantaneo verrà inviato all'indirizzo
                    email specificato.
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
