"use client";

import { Camera, LogOut, Trash2, User } from "lucide-react";
import NextImage from "next/image";

type ProfileTabProps = {
  profileName: string;
  setProfileName: (val: string) => void;
  profileImage: string | null;
  setProfileImage: (val: string | null) => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
};

export function ProfileTab({
  profileName,
  setProfileName,
  profileImage,
  setProfileImage,
  user,
  fileInputRef,
  handleFileChange,
  handleLogout,
}: ProfileTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Avatar + name */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl shrink-0">
            <User size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Informazioni Personali</p>
            <p className="text-[10px] text-(--text-muted)">
              Nome e foto profilo
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="relative group cursor-pointer border-0 p-0 bg-transparent rounded-full outline-none"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500/30 bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-2xl uppercase shadow-md transition-all group-hover:border-blue-500/60">
              {profileImage ? (
                <NextImage
                  src={profileImage}
                  alt={profileName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profileName ? profileName[0] : "S"}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
              <Camera size={16} className="mb-0.5" />
              <span>Cambia</span>
            </div>
          </button>
            <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-label="Carica immagine profilo"
          />
          {profileImage && (
            <button
              type="button"
              onClick={() => setProfileImage(null)}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-transparent border-0 cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={11} /> Rimuovi foto
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
              Nome
            </span>
            <input
              type="text"
              aria-label="Nome profilo"
              placeholder="Il tuo nome"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="h-11 px-3.5 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-foreground placeholder:text-(--text-muted) focus-within:ring-2 focus-within:ring-blue-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5 opacity-70">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
              Email
            </span>
            <input
              type="email"
              aria-label="Email account"
              value={user.email}
              disabled
              readOnly
              className="h-11 w-full px-3.5 bg-neutral-500/10 dark:bg-zinc-800/50 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-(--text-muted) cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl shrink-0">
            <LogOut size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Account</p>
            <p className="text-[10px] text-(--text-muted)">
              Azioni sull&apos;account
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 p-4 bg-neutral-500/5 rounded-2xl border border-(--card-border)/40">
            <div>
              <p className="text-xs font-bold">{user.name}</p>
              <p className="text-[10px] text-(--text-muted) truncate">
                {user.email}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-sm uppercase shrink-0">
              {profileImage ? (
                <NextImage
                  src={profileImage}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                (user.name?.[0] ?? "U")
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-rose-500 hover:bg-rose-500/10 text-xs font-bold rounded-2xl h-11 cursor-pointer flex items-center justify-center gap-2 border border-rose-500/20 bg-transparent transition-all"
          >
            <LogOut size={14} />
            Disconnetti Account
          </button>
        </div>
      </div>
    </div>
  );
}
