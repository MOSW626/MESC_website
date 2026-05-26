/**
 * Drive 업로드 시 파일명을 일관된 규칙으로 변환한다.
 *
 * 규칙:
 *   학습자료 → "[과목코드] 원본명.확장자"  (예: "[ME200] 5장 정리.pdf")
 *   평면도   → "{건물코드}-{N}F-{YYYYMMDD}.확장자" (예: "N7-3F-20260527.png")
 *   행사사진 → "{YYYY-MM-DD-행사명} (NNN).확장자" (예: "2026-05-10-신입생 환영회 (001).jpg")
 *   기타     → 원본 그대로 (불법 문자만 _ 치환)
 */

// Drive 가 거부하는 문자 + 운영체제 호환성 위해 제거
function safe(s: string): string {
  return s.replace(/[\\/:*?"<>|\r\n\t]/g, "_").trim();
}

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0 || i === name.length - 1) return "";
  return name.slice(i + 1).toLowerCase();
}

function base(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? name : name.slice(0, i);
}

function pad(n: number, w: number): string {
  return String(n).padStart(w, "0");
}

function ymd(d = new Date()): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1, 2)}${pad(d.getUTCDate(), 2)}`;
}

export function resourceFilename(courseCode: string, original: string): string {
  const e = ext(original);
  const b = safe(base(original));
  const c = safe(courseCode || "기타");
  return e ? `[${c}] ${b}.${e}` : `[${c}] ${b}`;
}

export function floorplanFilename(buildingCode: string, level: number, original: string): string {
  const e = ext(original) || "png";
  return safe(`${buildingCode}-${level}F-${ymd()}.${e}`);
}

export function eventPhotoFilename(eventDate: Date, eventTitle: string, index: number, original: string): string {
  const y = eventDate.getUTCFullYear();
  const m = pad(eventDate.getUTCMonth() + 1, 2);
  const d = pad(eventDate.getUTCDate(), 2);
  const t = safe(eventTitle);
  const e = ext(original) || "jpg";
  return `${y}-${m}-${d}-${t} (${pad(index, 3)}).${e}`;
}
