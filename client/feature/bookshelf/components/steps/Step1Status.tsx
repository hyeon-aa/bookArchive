import { BOOK_STATUS } from "@/app/constants/book_status";
import { BookStatus, UpdateBookshelfRequest } from "@/feature/bookshelf/type";
import { DateField } from "./DateField";
import { FunnelStepLayout } from "./FunnelStepLayout";

interface Step1Props {
  status: BookStatus;
  startDate: string;
  endDate: string;
  onChange: (fields: Partial<UpdateBookshelfRequest>) => void;
}

export function Step1Status({
  status,
  startDate,
  endDate,
  onChange,
}: Step1Props) {
  const isDone = status === "DONE";

  return (
    <FunnelStepLayout
      title={
        <>
          독서 기간과 <br /> 상태를 알려주세요.
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {BOOK_STATUS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ status: opt.value as BookStatus })}
            className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
              status === opt.value
                ? "border-[#7C9885] bg-[#F8FAF9] text-[#7C9885]"
                : "border-[#F3F4F6] text-[#A0A0A0]"
            }`}
          >
            <span className="text-lg">{opt.emoji}</span>
            <span className="text-xs font-bold">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <DateField
          label="시작한 날"
          value={startDate}
          onChange={(v) => onChange({ startDate: v })}
        />
        {isDone && (
          <DateField
            label="완독한 날"
            value={endDate}
            onChange={(v) => onChange({ endDate: v })}
            isAnimated
          />
        )}
      </div>
    </FunnelStepLayout>
  );
}
