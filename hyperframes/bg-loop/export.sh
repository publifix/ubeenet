#!/usr/bin/env sh
# Render del fondo y exportación a public/media/. Requiere Node >= 22 y FFmpeg.
# Uso: sh hyperframes/bg-loop/export.sh   (desde la raíz del repo o desde aquí)
set -e
cd "$(dirname "$0")"
OUT=out
MEDIA=../../public/media
mkdir -p "$OUT" "$MEDIA"

npx --yes hyperframes@0.8.190 lint
npx --yes hyperframes@0.8.190 check
npx --yes hyperframes@0.8.190 render --quality high --output "$OUT/bg-loop.mp4"
(cd mobile && npx --yes hyperframes@0.8.190 lint && npx --yes hyperframes@0.8.190 check && \
  npx --yes hyperframes@0.8.190 render --quality high --output "../$OUT/bg-loop-mobile.mp4")

for n in bg-loop bg-loop-mobile; do
  # VP9: CRF 32 (el brief sugiere ~38; a 38 se pierde la malla de 1 px y el peso sobra).
  ffmpeg -v error -y -i "$OUT/$n.mp4" -an -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p "$MEDIA/$n.webm"
  ffmpeg -v error -y -i "$OUT/$n.mp4" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart "$MEDIA/$n.mp4"
done
ffmpeg -v error -y -i "$OUT/bg-loop.mp4" -frames:v 1 -q:v 4 "$MEDIA/bg-poster.jpg"
ffmpeg -v error -y -i "$OUT/bg-loop-mobile.mp4" -frames:v 1 -q:v 4 "$MEDIA/bg-poster-mobile.jpg"
ls -la "$MEDIA"
