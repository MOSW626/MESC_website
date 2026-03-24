---
name: ME_website 개발 진행 상황
description: 2026-03-24 작업 내용 및 남은 작업
type: project
---

## 완료된 작업 (2026-03-24)

**Why:** 사용자가 KAIST 기계공학과 학생회 웹사이트 개발을 의뢰함.

### 링크 업데이트
- `lib/links.ts`: SNU → KAIST 링크로 교체
  - 기계공학과: https://me.kaist.ac.kr/
  - 포털: https://portal.kaist.ac.kr/
  - 총학생회: https://www.facebook.com/ua.kaist/
  - 학생처: https://www.kaist.ac.kr/kr/html/campus/05.html
  - 네이버 카페: https://cafe.naver.com/kaistme ✅
  - 인스타(학생회): https://www.instagram.com/i_love_mesc/ ✅
  - 인스타(학과): https://www.instagram.com/kaist_me/ ✅
  - 카카오톡: 추후 업데이트 예정

### 영어 지원 (i18n)
- `lib/language-context.tsx`: LanguageProvider + useLanguage hook 생성
- `lib/i18n.ts`: 전체 페이지 번역 추가 (notices, resources, calendar, checkFee, members 섹션)
- `components/layout-wrapper.tsx`: LanguageProvider 추가
- **Navbar**: 언어 전환 버튼 (🇺🇸 EN / 🇰🇷 KO) 추가, KAIST 표기
- **Footer**: 클라이언트 컴포넌트로 전환, i18n + KAIST SNS 링크 버튼 추가
- **home-client.tsx**: useLanguage 적용
- 모든 페이지 i18n 완료: notices, notices/[id], resources, calendar, check-fee, budget, members

### 보안 강화
- `lib/validation.ts`: 서버 전용 입력 검증 유틸리티 생성
  - isValidUrl: javascript:/data: 등 위험 스키마 차단
  - isValidString: 길이 및 타입 검사
  - isValidAmount: 금액 범위 검사 (최대 10억)
  - parseId: 양의 정수 ID 검증
  - isValidDate, isAllowedCategory
- 모든 API 라우트에 검증 적용:
  - notices/route.ts: title≤200, content≤10000
  - resources/route.ts: fileUrl URL 검증, title≤200
  - budget/route.ts: amount 범위, type/category 허용값, receiptUrl URL 검증
  - members/route.ts: name/role≤100, imageUrl URL 검증
  - 모든 [id] 라우트: NaN 방지 parseId 적용
- NEXTAUTH_SECRET: 48바이트 랜덤 base64url로 교체

### 관리자 UI 개선
- **로그인 페이지** (`/admin/login`):
  - 새로운 디자인 (Settings 아이콘, 홈으로 돌아가기 링크)
  - 비밀번호 보기/숨기기 토글
  - 보안 안내 메시지
  - 로딩 스피너
- **대시보드** (`/admin`):
  - 관리자 헤더 (로그아웃, 홈, 세션 뱃지)
  - 카드형 관리 메뉴 (아이콘 색상별 구분)
  - 빠른 링크 섹션
  - 보안 안내 (비밀번호 변경 방법 표시)

## 남은 작업

**How to apply:** 다음 대화에서 이어서 진행.

1. **Google Calendar 연동** - 관리자가 .env.local에 NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL, NEXT_PUBLIC_ICAL_URL 설정 필요
2. **예산 Google Sheets 연동** - 관리자가 NEXT_PUBLIC_BUDGET_SHEET_EMBED_URL, GOOGLE_BUDGET_CSV_URL 설정 필요
3. **카카오톡 오픈채팅** - 사용자가 추후 URL 제공 예정
4. **개인정보처리방침/이용약관 페이지** - /privacy, /terms 라우트 404
5. **관리자 페이지 admin/notices 등 영어 지원** - 관리자 페이지는 한국어 전용으로 놔둬도 됨
6. **Next.js 빌드 테스트** - npm run build로 타입 에러 확인 필요
7. **배포 설정** - Vercel 등 배포 환경 설정

## 관리자 계정 정보
- URL: /admin/login
- 아이디: admin (ADMIN_USERNAME in .env.local)
- 비밀번호: admin1234 (ADMIN_PASSWORD in .env.local - 변경 권장)
