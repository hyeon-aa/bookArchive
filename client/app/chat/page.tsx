"use client";

import { useEffect, useState } from "react";

export default function ChatPage() {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchStream = async () => {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
      });

      // response.body = ReadableStream (계속 흘러들어오는 데이터)
      const reader = response.body!.getReader();

      // 바이트 배열 → 문자열 변환기
      const decoder = new TextDecoder();

      // 미완성 데이터 임시 보관용 "data: {"te" 까지만 오고 다음 패킷에 "xt":"안"}\n\n" 올 수 있음
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        //events = ["data: {"text":"안"}"]
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          // `data: ` 접두사 제거 "data: {"text":"안"}" → "{"text":"안"}"
          const line = event.replace(/^data: /, "").trim();
          if (!line) continue;

          //문자열 → JSON 객체로 파싱 '{"text":"안"}' → { text: "안" }
          const chunk = JSON.parse(line);
          if (chunk.done) return;
          if (chunk.text) {
            setText((prev) => prev + chunk.text);
          }
        }
      }
    };
    fetchStream();
  }, []);

  return (
    <div>
      <p>{text}</p>
    </div>
  );
}
