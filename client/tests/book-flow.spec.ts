import { expect, test } from "@playwright/test";

test("책 검색부터 기록, 삭제까지 전체 워크플로우 테스트", async ({ page }) => {
  // 1. 페이지 접속 및 로그인
  await page.goto("http://localhost:3000/books/search");
  await page.getByRole("button", { name: "로그인" }).click();

  await page
    .getByRole("textbox", { name: "example@email.com" })
    .fill("test3@test.com");
  await page
    .getByRole("textbox", { name: "비밀번호를 입력하세요" })
    .fill("test3333");
  await page.getByRole("button", { name: "로그인" }).click();

  // 2. '돈의 방정식' 검색 및 '읽는 중' 등록
  await page
    .getByRole("textbox", { name: "책 제목이나 저자를 입력하세요" })
    .fill("돈의 방정식");
  await page.getByRole("main").getByRole("button", { name: "검색" }).click();

  // 특정 책 등록 버튼 클릭
  await page
    .getByRole("listitem")
    .filter({ hasText: "돈의 방정식" })
    .filter({ hasText: "모건 하우절" })
    .getByRole("button")
    .click();

  await page.getByRole("button", { name: "📖 읽는 중" }).click();

  // 3. '트럼프 2.0' 검색 및 '완독' 등록 (나중에 할래요)
  await page
    .getByRole("textbox", { name: "책 제목이나 저자를 입력하세요" })
    .fill("트럼프 2.0");
  await page.keyboard.press("Enter");

  await page
    .getByRole("listitem")
    .filter({ hasText: "트럼프 2.0 시대" })
    .filter({ hasText: "박종훈" })
    .getByRole("button")
    .click();

  await page.getByRole("button", { name: "✅ 완독" }).click();
  await page.getByRole("button", { name: "나중에 할래요" }).click();

  // 4. '파반느' 검색, 완독 및 감상평 기록
  await page
    .getByRole("textbox", { name: "책 제목이나 저자를 입력하세요" })
    .fill("파반느");
  await page.keyboard.press("Enter");

  await page
    .getByRole("listitem")
    .filter({ hasText: "죽은 왕녀를 위한 파반느" })
    .filter({ hasText: "박민규" })
    .getByRole("button")
    .first()
    .click();

  await page.getByRole("button", { name: "✅ 완독" }).click();
  await page.getByRole("button", { name: "지금 바로 기록하기" }).click();

  // 기록 상세 입력
  await page.getByRole("textbox").first().fill("2026-03-04");
  await page.getByRole("textbox").nth(1).fill("2026-03-07");
  await page.getByRole("button", { name: "🔗 연결" }).click();
  await page.getByRole("button", { name: "영화/드라마 원작 ✓" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: "📖 몰입" }).click();
  await page
    .getByRole("textbox", { name: "책을 읽고 난 후의 감상평을 적어보세요" })
    .fill("영화만큼 몰입감이 높았다.");
  await page.getByRole("button", { name: "다음" }).click();
  await page
    .getByRole("textbox", { name: "공유하고 싶은 책 속의 문장을 적어보세요" })
    .fill("파반느");
  await page.getByRole("button", { name: "기록 완료하기" }).click();
  await page.getByRole("button", { name: "확인" }).click();

  // 5. 내 서재에서 도구 확인 및 삭제 테스트
  await page.goto("http://localhost:3000/books/search");
  await page.getByRole("button", { name: "선택" }).click();
  await page.locator("div").filter({ hasText: "트럼프 2.0" }).nth(5).click();
  await page.getByRole("button", { name: "권 삭제하기" }).click();
  await page.getByRole("button", { name: "삭제하기", exact: true }).click();

  // 마지막 검증: 삭제 후 해당 텍스트가 안 보이는지 확인
  await expect(page.getByText(/트럼프 2.0/)).not.toBeVisible();
});
