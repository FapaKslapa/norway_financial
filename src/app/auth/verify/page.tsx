import Image from "next/image";

type VerifyPageProps = {
  searchParams: Promise<{ token?: string; callbackURL?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const token = params.token;
  const callbackURL = params.callbackURL || "/";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="bg-[var(--card-solid)] border border-[var(--card-border)] rounded-3xl p-8 max-w-sm w-full text-center">
          <p className="text-sm text-red-500 font-semibold">
            Link non valido o scaduto.
          </p>
        </div>
      </div>
    );
  }

  const verifyUrl = `/api/auth/magic-link/verify?token=${token}&callbackURL=${encodeURIComponent(callbackURL)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="bg-[var(--card-solid)] border border-[var(--card-border)] rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
        <Image src="/logo.png" alt="Gravio" width={52} height={52} className="rounded-2xl" />
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          Gravio
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-[260px] leading-relaxed">
          Clicca il pulsante per completare l'accesso.
        </p>
        <a
          href={verifyUrl}
          className="w-full bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          Accedi
        </a>
      </div>
    </div>
  );
}
