# Claude를 위한 종합 협업 가이드 (Full-Stack UI/UX)

## 1. 개요
본 문서는 기계공학과 학생회 웹사이트의 디자인 일관성을 유지하고, 향후 개발 효율성을 높이기 위해 작성되었습니다. 이 프로젝트는 **전문성, 기술적 미학, 사용자 중심**이라는 세 가지 핵심 가치를 기반으로 설계되었습니다.

## 2. 디자인 시스템 (DESIGN_SYSTEM.md)
모든 UI 작업의 최우선 순위는 `DESIGN_SYSTEM.md`를 준수하는 것입니다.
- **컬러 팔레트**: `globals.css`에 정의된 OKLCH 색상 변수(`--primary`, `--accent` 등)를 사용하세요.
- **유틸리티 클래스**: `glass-premium`, `tech-mesh`, `hover-lift-premium` 등 커스텀 유틸리티를 적극 활용하세요.
- **다크모드**: 라이트/다크 모드 각각에 최적화된 색상값이 정의되어 있으므로, `dark:` 프리픽스를 적절히 사용하세요.

## 3. 다크모드 시스템 (Custom Implementation)
외부 라이브러리(`next-themes`) 의존성 없이 작동하는 커스텀 테마 시스템이 구축되어 있습니다.
- **ThemeProvider**: `components/theme-provider.tsx`에서 `localStorage`와 `classList`를 통해 테마를 관리합니다.
- **ModeToggle**: `components/mode-toggle.tsx`를 통해 사용자가 테마를 전환할 수 있습니다.
- **사용법**: 컴포넌트 내에서 `useTheme` 훅을 사용하여 현재 테마 상태를 가져오거나 변경할 수 있습니다.

## 4. 다국어 지원 시스템 (i18n)
향후 영문 버전 출시를 대비하여 `lib/i18n.ts`에 번역 구조가 마련되어 있습니다.
- **번역 데이터**: `translations` 객체 내에 `ko`, `en` 언어별 텍스트가 계층적으로 정리되어 있습니다.
- **가이드**: 상세한 사용법은 `I18N_GUIDE.md`를 참조하세요.
- **권장 사항**: 새로운 텍스트 추가 시 하드코딩 대신 `lib/i18n.ts`에 키를 추가하고 `getTranslation()` 함수를 사용하세요.

## 5. UI/UX 레이아웃 규칙
- **Navbar**: 로고와 메뉴 사이에는 최소 `gap-12` 이상의 여백을 유지하여 시각적 답답함을 방지합니다.
- **Card**: `hover-lift-premium` 클래스를 적용하여 생동감 있는 인터랙션을 제공합니다.
- **Typography**: 제목은 `font-black`, 본문은 `text-muted-foreground`와 `leading-relaxed`를 기본으로 합니다.

## 6. Claude에게 전하는 메시지
이 웹사이트는 단순한 학과 홈페이지를 넘어, 학생회의 투명성과 전문성을 상징하는 플랫폼입니다. 기능을 추가할 때마다 **"이 디자인이 기계공학과의 전문성을 잘 나타내는가?"**를 자문해 주세요. 

이미 구축된 시스템(i18n, Theme System, Premium Utilities)을 잘 활용하면, 코드의 양은 줄이면서 훨씬 더 '야무진' 결과물을 낼 수 있을 것입니다.

---
**작성자**: Manus AI
**최종 업데이트**: 2026년 3월 24일
