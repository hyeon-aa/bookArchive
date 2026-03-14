"use client";

import { AIMessageSheet } from "@/feature/bookshelf/components/AIMessageSheet";
import { useUpdateBook } from "@/feature/bookshelf/queries";
import {
  BookshelfItemResponse,
  BookStatus,
  UpdateBookshelfRequest,
} from "@/feature/bookshelf/type";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LevelUpModal } from "@/shared/components/common/LevelUpModal";
import { useModal } from "@/shared/hooks/useModal";
import { FunnelFooter } from "./steps/FunnelFooter";
import { Step1Status } from "./steps/Step1Status";
import { Step2Review } from "./steps/Step2Review";

export function BookshelfRecordForm({ item }: { item: BookshelfItemResponse }) {
  const router = useRouter();
  const { mutate: updateBook, isPending: isSaving } = useUpdateBook(item.id);

  const [step, setStep] = useState(1);
  const { open } = useModal();
  const [aiMessage, setAIMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateBookshelfRequest>({
    status: item.status,
    comment: item.comment || "",
    emotion: item.emotion || "",
    startDate: item.startDate
      ? new Date(item.startDate).toISOString().split("T")[0]
      : "",
    endDate: item.endDate
      ? new Date(item.endDate).toISOString().split("T")[0]
      : "",
    title: item.book.title,
  });

  const isDone = formData.status === "DONE";
  const totalSteps = isDone ? 2 : 1;

  const updateFields = (fields: Partial<UpdateBookshelfRequest>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSave = () => {
    const finalPayload: UpdateBookshelfRequest = {
      ...formData,
      comment: isDone ? formData.comment : undefined,
      emotion: isDone ? formData.emotion : undefined,
      endDate: isDone ? formData.endDate : undefined,
    };

    updateBook(finalPayload, {
      onSuccess: (data) => {
        const handleNextStep = () => {
          if (data?.aiComment) {
            setAIMessage(data.aiComment);
          } else {
            router.push("/bookshelf");
          }
        };

        if (data.isLevelUp) {
          open(() => (
            <LevelUpModal level={data.newLevel} onNext={handleNextStep} />
          ));
        } else {
          handleNextStep();
        }
      },
      onError: (error) => {
        alert(
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다."
        );
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto relative shadow-xl">
      <div className="flex w-full gap-1 px-5 pt-4 absolute top-0 left-0 z-10 bg-white/80 backdrop-blur-sm pb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${
              i + 1 <= step ? "bg-[#7C9885]" : "bg-[#F3F4F6]"
            }`}
          />
        ))}
      </div>

      <main className="flex-1 px-5 pt-16 pb-32 overflow-y-auto overflow-x-hidden">
        {step === 1 && (
          <Step1Status
            status={formData.status as BookStatus}
            startDate={formData.startDate || ""}
            endDate={formData.endDate || ""}
            onChange={updateFields}
          />
        )}

        {step === 2 && (
          <Step2Review
            emotion={formData.emotion || ""}
            comment={formData.comment || ""}
            onChange={updateFields}
          />
        )}
      </main>

      <FunnelFooter
        step={step}
        totalSteps={totalSteps}
        isSaving={isSaving}
        isValid={step === 2 ? !!formData.emotion : true}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onSave={handleSave}
      />

      <AIMessageSheet
        open={!!aiMessage}
        message={aiMessage ?? ""}
        onClose={() => {
          setAIMessage(null);
          router.push("/bookshelf");
        }}
      />
    </div>
  );
}
