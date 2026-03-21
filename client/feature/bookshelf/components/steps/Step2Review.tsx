import { UpdateBookshelfRequest } from "@/feature/bookshelf/type";
import { EMOTIONS } from "@/shared/constants/emotion";
import { Check, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useFormContext } from "react-hook-form";
import { FunnelStepLayout } from "./FunnelStepLayout";

export function Step2Review() {
  const { control, register } = useFormContext<UpdateBookshelfRequest>();

  return (
    <FunnelStepLayout
      title="어떤 기분이 드시나요?"
      description="책을 덮으며 느꼈던 마음을 남겨주세요."
    >
      <Controller
        name="emotion"
        control={control}
        rules={{ required: "감정을 선택해주세요." }}
        render={({ field }) => (
          <div className="grid grid-cols-3 gap-2">
            {EMOTIONS.map((emotion) => (
              <motion.button
                layout
                whileTap={{ scale: 0.92 }}
                key={emotion.label}
                type="button"
                onClick={() => field.onChange(emotion.label)}
                className={`relative py-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  field.value === emotion.label
                    ? `${emotion.color} border-transparent text-[#4B5563]`
                    : "border-[#F3F4F6] text-[#A0A0A0] bg-white"
                }`}
              >
                <span className="text-xl">{emotion.emoji}</span>
                <span className="text-[11px] font-bold">{emotion.label}</span>
                {field.value === emotion.label && (
                  <div className="absolute -top-1 -right-1 bg-current rounded-full p-0.5 shadow-sm">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      />

      <div className="space-y-2 mt-6">
        <label className="text-xs font-bold text-[#7C9885] flex items-center gap-2 px-1 uppercase tracking-wider">
          <MessageSquare size={14} /> 한줄평
        </label>
        <textarea
          {...register("comment", { required: "한줄평을 작성해주세요." })}
          placeholder="책을 읽고 난 후의 감상평을 적어보세요."
          className="w-full p-4 bg-[#F9FAFB] rounded-2xl min-h-[160px] text-sm outline-none focus:ring-2 ring-[#7C9885]/20 resize-none border-none placeholder:text-gray-300"
        />
      </div>
    </FunnelStepLayout>
  );
}
