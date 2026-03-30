"use client";

import { AIMessageSheet } from "@/feature/bookshelf/components/AIMessageSheet";
import { useUpdateBook } from "@/feature/bookshelf/queries";
import {
  BookshelfItemResponse,
  UpdateBookshelfRequest,
} from "@/feature/bookshelf/type";
import { LevelUpModal } from "@/shared/components/common/LevelUpModal";
import { useModal } from "@/shared/hooks/useModal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { FunnelFooter } from "./steps/FunnelFooter";
import { Step1Status } from "./steps/Step1Status";
import { Step2Review } from "./steps/Step2Review";
import { Step3Phrase } from "./steps/Step3Phrase";

export function BookshelfRecordForm({ item }: { item: BookshelfItemResponse }) {
  const router = useRouter();
  const { mutate: updateBook, isPending: isSaving } = useUpdateBook(item.id);
  const { open } = useModal();
  const [step, setStep] = useState(1);
  const [aiMessage, setAIMessage] = useState<string | null>(null);

  const methods = useForm<UpdateBookshelfRequest>({
    defaultValues: {
      status: item.status,
      comment: item.comment || "",
      emotion: item.emotion || "",
      phrase: item.phrase || "",
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().split("T")[0]
        : "",
      endDate: item.endDate
        ? new Date(item.endDate).toISOString().split("T")[0]
        : "",
      title: item.book.title,
      intent: item.intent || "",
      sub: item.sub || "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, dirtyFields },
  } = methods;

  const status = useWatch({
    control,
    name: "status",
  });
  const isDone = status === "DONE";
  const totalSteps = isDone ? 3 : 1;

  const onSubmit = (data: UpdateBookshelfRequest) => {
    const isReviewChanged = !!(dirtyFields.emotion || dirtyFields.comment);

    const finalPayload = {
      ...data,
      comment: isDone ? data.comment : undefined,
      emotion: isDone ? data.emotion : undefined,
      phrase: isDone ? data.phrase : undefined,
      endDate: isDone ? data.endDate : undefined,
    };

    updateBook(finalPayload, {
      onSuccess: (res) => {
        const handleNextStep = () => {
          if (res?.aiComment && isReviewChanged) {
            setAIMessage(res.aiComment);
          } else router.push("/bookshelf");
        };

        if (res?.isLevelUp) {
          open(() => (
            <LevelUpModal level={res.newLevel!} onNext={handleNextStep} />
          ));
        } else {
          handleNextStep();
        }
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col min-h-screen bg-white max-w-md mx-auto relative shadow-xl"
      >
        <div className="flex w-full gap-1 px-5 pt-4 absolute top-0 left-0 z-10 bg-white/80 backdrop-blur-sm pb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                i + 1 <= step ? "bg-[#7C9885]" : "bg-[#F3F4F6]"
              }`}
            />
          ))}
        </div>

        <main className="flex-1 px-5 pt-16 pb-32 overflow-y-auto">
          {step === 1 && <Step1Status />}
          {step === 2 && <Step2Review />}
          {step === 3 && <Step3Phrase />}
        </main>

        <FunnelFooter
          step={step}
          totalSteps={totalSteps}
          isSaving={isSaving}
          isValid={isValid}
          onPrev={() => setStep((s) => s - 1)}
          onNext={() => setStep((s) => s + 1)}
        />

        <AIMessageSheet
          open={!!aiMessage}
          message={aiMessage ?? ""}
          onClose={() => {
            setAIMessage(null);
            router.push("/bookshelf");
          }}
        />
      </form>
    </FormProvider>
  );
}
