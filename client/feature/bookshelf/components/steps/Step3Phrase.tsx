import { UpdateBookshelfRequest } from "@/feature/bookshelf/type";
import { Quote } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FunnelStepLayout } from "./FunnelStepLayout";

export function Step3Phrase() {
  const { register } = useFormContext<UpdateBookshelfRequest>();

  return (
    <FunnelStepLayout
      title="마음에 남은 문장이 있나요?"
      description="공유하고 싶은 한 줄을 적어주세요."
    >
      <div className="space-y-4">
        <label className="text-xs font-bold text-[#7C9885] flex items-center gap-2 px-1">
          <Quote size={14} /> 문장 적기
        </label>
        <textarea
          {...register("phrase")}
          placeholder="공유하고 싶은 책 속의 문장을 적어보세요."
          className="w-full p-4 bg-[#F9FAFB] rounded-2xl min-h-[300px] text-sm outline-none focus:ring-2 ring-[#7C9885]/20 resize-none border-none"
        />
      </div>
    </FunnelStepLayout>
  );
}
