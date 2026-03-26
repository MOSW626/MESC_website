# 정찰 보고서: mesc-website.vercel.app

**일자:** 2026-03-26
**대상:** https://mesc-website.vercel.app
**호스팅:** Vercel (엣지: ICN 서울 → 오리진: IAD 미국)
**기술 스택:** Next.js (App Router) + Turso/LibSQL + NextAuth.js v5 (JWT)
**점검 도구:** github.com/shuvonsec/claude-bug-bounty

---

## 1. 인프라 및 기술 스택

| 구성요소 | 기술 |
|---------|------|
| 호스팅 | Vercel (엣지: ICN 서울, 오리진: IAD 미국) |
| 프레임워크 | Next.js (App Router, Turbopack) |
| 데이터베이스 | SQLite via Prisma + LibSQL (Turso) |
| 인증 | NextAuth.js v5.0.0-beta.30 (Credentials + JWT) |
| 파일 저장소 | Vercel Blob (`wuuc3j4s06uiqpul.public.blob.vercel-storage.com`) |
| 외부 데이터 | Google Sheets CSV (예산, 학생회비 조회) |
| 캘린더 | iCal 피드 연동 |
| PWA | 지원 (manifest.webmanifest) |

---

## 2. 공격 표면 지도

### 2.1 페이지 (총 21개 라우트)

**공개 페이지:** `/`, `/calendar`, `/notices`, `/notices/[id]`, `/resources`, `/courses`, `/courses/[code]`, `/members`, `/budget`, `/check-fee`, `/community`, `/community/[id]`

**관리자 페이지 (인증 필요):** `/admin`, `/admin/login`, `/admin/notices`, `/admin/resources`, `/admin/members`, `/admin/courses`, `/admin/events`, `/admin/budget`, `/admin/snack-wishes`

### 2.2 API 엔드포인트 (총 20개 라우트)

| 엔드포인트 | 메서드 | 인증 필요 | 속도 제한 |
|-----------|--------|----------|----------|
| `/api/notices` | GET, POST | POST만 | 없음 |
| `/api/notices/[id]` | GET, PUT, DELETE | PUT/DELETE만 | 없음 |
| `/api/resources` | GET, POST | POST만 | 없음 |
| `/api/resources/[id]` | PUT, DELETE | 필요 | 없음 |
| `/api/courses` | GET, POST | POST만 | 없음 |
| `/api/courses/[id]` | PUT, DELETE | 필요 | 없음 |
| `/api/events` | GET, POST | POST만 | 없음 |
| `/api/events/[id]` | GET, PUT, DELETE | PUT/DELETE만 | 없음 |
| `/api/events/[id]/photos` | POST, DELETE | 필요 | 없음 |
| `/api/events/[id]/feedback` | GET, POST | 불필요 | 10분당 5회 |
| `/api/members` | GET, POST | POST만 | 없음 |
| `/api/members/[id]` | PUT, DELETE | 필요 | 없음 |
| `/api/budget` | GET, POST | POST만 | 없음 |
| `/api/budget/[id]` | DELETE | 필요 | 없음 |
| `/api/budget-summary` | GET | 불필요 | 캐시 5분 |
| `/api/check-fee` | GET | 불필요 | 분당 10회 |
| `/api/calendar-events` | GET | 불필요 | 캐시 10분 |
| `/api/upload` | POST | 필요 | 없음 |
| `/api/snack-wishes` | GET, POST, DELETE | DELETE만 | POST: 10분당 3회 |
| `/api/auth/[...nextauth]` | GET, POST | 해당없음 | 없음 |

### 2.3 NextAuth 엔드포인트 (정보 노출)

| 엔드포인트 | 노출 데이터 |
|-----------|------------|
| `/api/auth/csrf` | CSRF 토큰 누구나 조회 가능 |
| `/api/auth/providers` | 인증 제공자 설정: `credentials` |
| `/api/auth/session` | 세션 상태 (비인증시 null 반환) |
| `/api/auth/signin` | 로그인 페이지 |

---

## 3. 보안 헤더 분석

### 적용됨 (양호)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — HTTPS 강제
- `X-Content-Type-Options: nosniff` — MIME 스니핑 방지
- `X-Frame-Options: SAMEORIGIN` — 클릭재킹 방지
- `Referrer-Policy: strict-origin-when-cross-origin` — 리퍼러 정보 제한
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — 브라우저 기능 제한
- `X-DNS-Prefetch-Control: on` — DNS 프리페치 활성화

### 미적용 (취약)
- **`Content-Security-Policy`** — CSP 헤더 없음. XSS 발견 시 제한 없이 악용 가능
- **`X-Permitted-Cross-Domain-Policies`** — 미설정

### 정보 노출
- `Server: Vercel` — 호스팅 플랫폼 식별 가능
- `X-Powered-By: Next.js` — 프레임워크 식별 가능
- `X-Vercel-Cache: MISS/HIT` — 캐시 동작 노출
- `X-Vercel-Id: icn1::iad1::*` — 엣지/오리진 인프라 구조 노출
- `X-Matched-Path: /path` — 라우트 매칭 패턴 노출

---

## 4. 인증 분석

### 구조
- **제공자:** Credentials (사용자명/비밀번호)
- **세션:** JWT 전략 (스테이트리스, httpOnly 쿠키)
- **관리자:** 단일 계정 (환경변수: `ADMIN_USERNAME`, `ADMIN_PASSWORD`)

### 발견 사항

| # | 발견 사항 | 심각도 | 상세 |
|---|----------|--------|------|
| A1 | **로그인 무차별 대입 공격 방어 없음** | 높음 | 연속 5회 실패 로그인 시도에도 잠금, 지연, 속도 제한 없음. `/api/auth/callback/credentials` 엔드포인트가 무제한 시도 허용 |
| A2 | **비밀번호 평문 비교** | 중간 | 소스 코드상 `ADMIN_PASSWORD` 환경변수와 직접 문자열 비교. bcrypt/argon2 해싱 미적용 |
| A3 | **단일 관리자 계정, RBAC 없음** | 낮음 | 하나의 자격증명으로 모든 관리 기능 제어. 역할 분리 없음 |
| A4 | **CSRF 토큰 공개 접근 가능** | 정보 | `/api/auth/csrf`에서 누구나 유효한 CSRF 토큰 조회 가능 (NextAuth 기본 동작) |

---

## 5. CORS 및 교차 출처 정책

- API 응답에 **CORS 헤더 없음** (`Access-Control-Allow-Origin` 미설정)
- **OPTIONS 프리플라이트** 요청 시 `204` 응답, `Allow: GET, HEAD, OPTIONS, POST`
- **영향:**
  - API는 동일 출처에서만 접근 가능 (교차 출처 JS에서 응답 읽기 불가)
  - 단, 폼 기반 CSRF는 POST 엔드포인트에서 가능:
    - API 라우트에 별도 CSRF 미들웨어 없음
    - `Content-Type: application/json` 사용으로 일부 보호 (프리플라이트 필요)

---

## 6. 데이터 노출

### 공개 API 응답

| 엔드포인트 | 노출 데이터 | 위험도 |
|-----------|------------|--------|
| `/api/members` | 임원 이름, 직책, 국, 학생회 여부, 사진 URL | 낮음 — 의도적 공개 |
| `/api/budget-summary` | 수입 (₩4,043,606), 지출 (₩1,708,197), 잔액, 월별 내역, 카테고리별 지출 | **중간** — 재정 데이터 비인증 접근 가능 |
| `/api/events` | 행사 상세 + Vercel Blob 저장소 사진 URL 전체 | 낮음 |
| `/api/events/[id]/feedback` | 사용자 후기 내용 및 평점 | 낮음 |
| `/api/snack-wishes` | 전체 간식 위시리스트 | 낮음 |

### Vercel Blob 저장소
- **도메인:** `wuuc3j4s06uiqpul.public.blob.vercel-storage.com`
- **디렉토리 목록:** 비활성화 (400 응답)
- **개별 파일:** URL 직접 접근으로 공개 열람 가능
- **위험:** Blob URL을 아는 누구나 파일 접근 가능. URL이 타임스탬프 기반 명명 (`{timestamp}-{filename}`)으로 추측 가능

---

## 7. 속도 제한 분석

| 엔드포인트 | 제한 | 시간 창 | 방식 | 우회 가능성 |
|-----------|------|---------|------|------------|
| `/api/check-fee` | 10회 | 1분 | IP 기반, 인메모리 | 서버 재시작 시 초기화, IP 변경으로 우회 |
| `/api/snack-wishes` (POST) | 3회 | 10분 | IP 기반, 인메모리 | 동일 |
| `/api/events/[id]/feedback` | 5회 | 10분 | IP 기반, 인메모리 | 동일 |
| **로그인 엔드포인트** | **없음** | 해당없음 | 해당없음 | **무제한 시도 가능** |

**검증 완료:** check-fee (11번째 요청에서 429 응답), snack-wishes (4번째 요청에서 429 응답) 속도 제한 정상 작동 확인

**취약점:** 인메모리 속도 제한은 Vercel 함수 콜드 스타트 시 초기화되며, 리전 간 분산되지 않음

---

## 8. 입력값 검증

| 엔드포인트 | 검증 내용 | 비고 |
|-----------|----------|------|
| `/api/check-fee` | 학번: 6~12자리 숫자만 허용 | `<script>` 주입 시 400 반환. 양호 |
| `/api/notices` | 제목 최대 200자, 내용 최대 10,000자, 카테고리 enum | 서버 측 검증 |
| `/api/resources` | URL 프로토콜 화이트리스트 (http/https) | `javascript:`, `data:` URI 차단 |
| `/api/upload` | MIME 화이트리스트 + 5MB 제한 | image/jpeg, png, webp, gif만 허용 |
| `/api/events/[id]/photos` | MIME 화이트리스트 + 10MB 제한 | upload와 동일 유형 |
| `/api/snack-wishes` | 내용 최대 100자 | 서버 측 검증 |
| `/api/budget` | 금액 최대 10억, 영수증 URL 검증 | 서버 측 검증 |

---

## 9. 민감 경로 탐색

| 경로 | 상태 | 비고 |
|------|------|------|
| `/.env` | 404 | 노출되지 않음 |
| `/.git/config` | 404 | 노출되지 않음 |
| `/next.config.js` | 404 | 노출되지 않음 |
| `/robots.txt` | 404 | 파일 없음 |
| `/sitemap.xml` | 404 | 파일 없음 |
| `/manifest.webmanifest` | 404 (HTML) | Next.js 404 페이지 반환 (매니페스트 미제공) |
| `/sw.js` | 404 | 서비스 워커 없음 |

---

## 10. 취약점 우선순위 요약

### 심각 (Critical)
*(발견 없음)*

### 높음 (High)

| # | 발견 사항 | 분류 | 공격 벡터 |
|---|----------|------|----------|
| H1 | **로그인 무차별 대입 공격 방어 없음** | 인증 | `/api/auth/callback/credentials`에 대한 무제한 크리덴셜 스터핑 가능. 단일 관리자 계정 = 고가치 표적 |

### 중간 (Medium)

| # | 발견 사항 | 분류 | 공격 벡터 |
|---|----------|------|----------|
| M1 | **Content-Security-Policy 헤더 없음** | XSS | Stored XSS 발견 시 인라인 스크립트, 외부 스크립트 로딩 등 제한 없이 악용 가능 |
| M2 | **재정 데이터 비인증 공개 접근** | 데이터 노출 | `/api/budget-summary`에서 수입/지출/잔액 정보를 인증 없이 조회 가능 |
| M3 | **인메모리 속도 제한** | DoS/악용 | 콜드 스타트 시 초기화, Vercel 엣지 리전 간 미분산 |
| M4 | **비밀번호 평문 비교** | 인증 | 환경변수 유출 시 (Vercel 대시보드 침해, 로그 노출) 비밀번호 즉시 사용 가능 |

### 낮음 (Low)

| # | 발견 사항 | 분류 | 비고 |
|---|----------|------|------|
| L1 | **X-Powered-By 헤더 정보 노출** | 정보 노출 | Next.js 프레임워크 식별 가능 |
| L2 | **순차 정수 ID 사용** | IDOR 표면 | 모든 엔티티가 자동 증가 ID 사용. 공개 GET 엔드포인트에서 예측 가능한 열거 가능 |
| L3 | **robots.txt / sitemap.xml 없음** | 설정 | 검색 엔진이 관리자 로그인 페이지를 인덱싱할 수 있음 |
| L4 | **Vercel Blob URL 공개 접근** | 데이터 노출 | 업로드 이미지가 타임스탬프 기반 추측 가능한 이름으로 공개 |
| L5 | **감사 로깅 없음** | 책임 추적 | 관리자 행동에 대한 가시성 없음 |
| L6 | **PWA 매니페스트 404 반환** | 설정 | `/manifest.webmanifest` 정상 작동하지 않음 |

---

## 11. 권장 조치 및 처리 현황

### ✅ 완료 (2026-03-26 패치)

| 항목 | 조치 |
|------|------|
| H1 — 로그인 무차별 대입 | `app/api/auth/[...nextauth]/route.ts`에 IP당 5분/5회 rate limit 추가 |
| M1 — CSP 헤더 없음 | `next.config.ts`에 Content-Security-Policy 헤더 추가 |
| L1 — X-Powered-By 노출 | `next.config.ts`에 `poweredByHeader: false` 추가 |
| L3 — robots.txt 없음 | `public/robots.txt` 생성, `/admin` 및 `/api/` 크롤링 차단 |
| L6 — PWA 매니페스트 404 | 재확인 결과 `app/manifest.ts` + `app/layout.tsx` 정상 구현됨 (점검 당시 미배포 상태였던 것으로 추정) |

### ⏸ 보류 (의도적 설계 or 낮은 위협)

| 항목 | 이유 |
|------|------|
| M2 — 예산 공개 | 투명성을 위한 의도적 설계 |
| M3 — 인메모리 rate limit | 학생회 규모에서 허용 가능. Upstash Redis 전환은 추후 고려 |
| M4 — 비밀번호 평문 비교 | env var 기반이라 실 위협 낮음. 추후 bcrypt 적용 고려 |
| A3 — 단일 관리자 계정 | 설계 결정 |
