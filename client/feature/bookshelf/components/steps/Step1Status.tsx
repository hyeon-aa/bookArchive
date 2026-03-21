import { UpdateBookshelfRequest } from "@/feature/bookshelf/type";
import { BOOK_STATUS } from "@/shared/constants/book_status";
import { INTENTS } from "@/shared/constants/intent";
import { Bookmark } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { DateField } from "./DateField";
import { FunnelStepLayout } from "./FunnelStepLayout";

export function Step1Status() {
  const { control, setValue, watch } = useFormContext<UpdateBookshelfRequest>();
  const status = watch("status");
  const intent = watch("intent");

  return (
    <FunnelStepLayout
      title={
        <>
          독서 기간과 <br /> 목적을 알려주세요.
        </>
      }
    >
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-3 gap-2">
            {BOOK_STATUS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => field.onChange(opt.value)}
                className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  field.value === opt.value
                    ? "border-[#7C9885] bg-[#F8FAF9] text-[#7C9885]"
                    : "border-[#F3F4F6] text-[#A0A0A0]"
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      />

      <div className="space-y-4 mt-6">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateField
              label="시작한 날"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {status === "DONE" && (
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateField
                label="완독한 날"
                value={field.value}
                onChange={field.onChange}
                isAnimated
              />
            )}
          />
        )}
      </div>

      <div className="space-y-6 mt-8">
        <div className="flex items-center gap-2 ml-1">
          <Bookmark size={14} className="text-[#7C9885] fill-[#7C9885]/10" />
          <h3 className="text-xs font-bold text-[#7C9885] uppercase tracking-wider">
            읽은 목적
          </h3>
        </div>
        <Controller
          name="intent"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(INTENTS).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    field.onChange(key);
                    setValue("sub", "");
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all active:scale-95 ${
                    field.value === key
                      ? "border-[#7C9885] bg-[#F8FAF9] text-[#7C9885] font-bold shadow-sm"
                      : "border-[#F3F4F6] bg-white text-[#A0A0A0]"
                  }`}
                >
                  <span className="text-base">{value.emoji}</span>
                  <span className="text-sm">{key}</span>
                </button>
              ))}
            </div>
          )}
        />

        {intent && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-bold text-[#A0A0A0] mb-3 ml-1">
              상세 이유를 선택해주세요
            </p>
            <Controller
              name="sub"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2">
                  {INTENTS[intent as keyof typeof INTENTS]?.subs.map(
                    (subValue, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value === subValue ? "" : subValue
                          )
                        }
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          field.value === subValue
                            ? "border-[#7C9885] bg-[#F8FAF9] text-[#7C9885]"
                            : "border-[#F3F4F6] bg-white text-[#A0A0A0]"
                        }`}
                      >
                        <span className="text-sm font-bold">{subValue}</span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                            field.value === subValue
                              ? "bg-[#7C9885] border-[#7C9885] text-white"
                              : "bg-white border-[#F3F4F6]"
                          }`}
                        >
                          <span className="text-xs font-bold">✓</span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            />
          </div>
        )}
      </div>
    </FunnelStepLayout>
  );
}
