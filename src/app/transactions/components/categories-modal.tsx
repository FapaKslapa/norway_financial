"use client";

import { AnimatePresence, m } from "framer-motion";
import type React from "react";
import { useReducer, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { CategoriesModalHeader } from "./categories-modal-header";
import { CategoryFormPanel } from "./category-form-panel";
import { CategoryListPanel } from "./category-list-panel";
import {
  formReducer,
  initialFormState,
  type Category,
} from "./category-types";

type CategoriesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  onUpdateCategory: (cat: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
};

export function CategoriesModal({
  isOpen,
  onClose,
  categories,
  onDeleteCategory,
  onCreateCategory,
  onUpdateCategory,
}: CategoriesModalProps) {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const { editingId, newCatName, newCatIcon, newCatColor, mobilePanel } =
    formState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateCategory({
          id: editingId,
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
      } else {
        await onCreateCategory({
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
      }
      dispatch({ type: "RESET_FORM" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 md:bg-black/70 md:backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4">
          <m.div
            initial={
              isMobile ? { y: "100%" } : { opacity: 0, scale: 0.97, y: 16 }
            }
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={
              isMobile ? { y: "100%" } : { opacity: 0, scale: 0.97, y: 16 }
            }
            transition={
              isMobile
                ? { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
                : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 120 || info.velocity.y > 500)) {
                onClose();
              }
            }}
            className="bg-(--card-solid) border border-(--card-border) w-full md:max-w-[760px] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl text-foreground flex flex-col h-[88dvh] md:h-auto md:max-h-[620px] overflow-hidden"
          >
            {/* Mobile drag handle */}
            <div className="flex md:hidden justify-center pt-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-(--card-border)" />
            </div>

            <CategoriesModalHeader
              categoriesCount={categories.length}
              editingId={editingId}
              mobilePanel={mobilePanel}
              dispatch={dispatch}
              onClose={onClose}
            />

            <div className="flex-1 flex flex-col md:flex-row gap-6 mt-4 md:mt-6 overflow-hidden px-6 md:px-8 pb-6 md:pb-8">
              {/* Left: category list */}
              <div
                className={cn(
                  "flex-col gap-3 min-w-0 md:min-w-[280px] overflow-hidden",
                  mobilePanel === "list" ? "flex" : "hidden md:flex",
                )}
              >
                <CategoryListPanel
                  categories={categories}
                  dispatch={dispatch}
                  onDeleteCategory={onDeleteCategory}
                />
              </div>

              <div className="w-[1px] bg-(--card-border)/50 hidden md:block shrink-0" />

              {/* Right: create/edit form */}
              <div
                className={cn(
                  "flex-col gap-4 min-w-0 md:min-w-[280px] overflow-hidden",
                  mobilePanel === "form" ? "flex" : "hidden md:flex",
                )}
              >
                <CategoryFormPanel
                  editingId={editingId}
                  newCatName={newCatName}
                  newCatIcon={newCatIcon}
                  newCatColor={newCatColor}
                  isSubmitting={isSubmitting}
                  dispatch={dispatch}
                  onSubmit={handleSubmit}
                  onCancelEdit={() => dispatch({ type: "CANCEL_EDIT" })}
                />
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
