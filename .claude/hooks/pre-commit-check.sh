#!/usr/bin/env bash
# git commit 전에 server의 tsc/eslint를 돌려서 에러가 있으면 커밋을 막는다.
# PreToolUse 훅(Bash, if: git commit*)으로 호출됨.

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  # 레포 바깥이면 그냥 통과 (이 훅이 관여할 상황이 아님)
  exit 0
fi

cd "$REPO_ROOT/server" || exit 0

TSC_OUT=$(npx tsc --noEmit -p tsconfig.json 2>&1)
TSC_STATUS=$?

ESLINT_OUT=$(npx eslint src 2>&1)
ESLINT_STATUS=$?

if [ $TSC_STATUS -ne 0 ] || [ $ESLINT_STATUS -ne 0 ]; then
  REASON="server 검증 실패로 커밋이 차단됐습니다."
  if [ $TSC_STATUS -ne 0 ]; then
    REASON="$REASON

[tsc 에러]
$(echo "$TSC_OUT" | head -n 30)"
  fi
  if [ $ESLINT_STATUS -ne 0 ]; then
    REASON="$REASON

[eslint 에러]
$(echo "$ESLINT_OUT" | head -n 30)"
  fi

  jq -n --arg reason "$REASON" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 0
fi

exit 0
