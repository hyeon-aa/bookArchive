import { toPng } from "html-to-image";
import { Download, Quote, X } from "lucide-react";
import { useRef, useState } from "react";

interface SharePreviewModalProps {
  phrase: string;
  title: string;
  onClose: () => void;
}

export function SharePreviewModal({
  phrase,
  title,
  onClose,
}: SharePreviewModalProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isPending, setIsPending] = useState(false);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setIsPending(true);

    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `book-quote-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 z-10"
        >
          <X size={20} />
        </button>

        <h3 className="text-center text-[10px] font-black text-gray-300 mb-6 tracking-[0.2em] uppercase">
          Preview Card
        </h3>

        <div
          ref={captureRef}
          className="w-full aspect-[4/5] rounded-[2rem] p-10 flex flex-col justify-center items-center text-center bg-[#7C9885] shadow-lg"
        >
          <Quote size={24} className="mb-6 opacity-30 text-white" />
          <p className="text-white text-lg font-serif leading-relaxed break-keep">
            {phrase}
          </p>
          <div className="mt-8 w-8 h-[1px] bg-white/30" />
          <p className="mt-4 text-white/50 text-[10px] tracking-widest font-light uppercase">
            {title}
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isPending}
          className="w-full mt-8 py-4 bg-[#4A4A4A] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Download size={18} />
          {isPending ? "저장 중..." : "이미지로 저장하기"}
        </button>
      </div>
    </div>
  );
}
