#!/usr/bin/env bash
# 포토부스 재배포: 이 폴더(단일 소스) -> GitHub Pages
# 사용: ./deploy.sh
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
REPO="${PB_REPO:-nikky-heewon-jeon/photobooth}"
DEPLOY="${PB_DEPLOY_DIR:-$HOME/.cache/${REPO##*/}-deploy}"  # cc git 트리 밖

# 배포 클론 준비
if [ ! -d "$DEPLOY/.git" ]; then
  echo "clone $REPO -> $DEPLOY"
  mkdir -p "$(dirname "$DEPLOY")"
  gh repo clone "$REPO" "$DEPLOY"
fi

cd "$DEPLOY"
git pull -q --ff-only || true

# 소스 동기화 (삭제된 에셋도 반영되도록 assets 통째 교체)
rm -rf "$DEPLOY/assets"; mkdir -p "$DEPLOY/assets"
cp "$SRC/"*.html "$DEPLOY/"
cp "$SRC/assets/"* "$DEPLOY/assets/"

git add -A
if git diff --cached --quiet; then
  echo "변경 없음 — 배포 스킵"
  exit 0
fi
git -c user.email=nikky@baconrealism.com -c user.name=nikky-heewon-jeon \
  commit -qm "재배포 $(date '+%Y-%m-%d %H:%M')"
git push -q
echo "배포 완료: https://${REPO%%/*}.github.io/${REPO##*/}/ (반영까지 ~1분)"
