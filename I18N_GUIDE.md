# 다국어 지원 (i18n) 가이드

## 개요

이 프로젝트는 한국어(ko)와 영어(en) 두 가지 언어를 지원하도록 설계되었습니다. 모든 텍스트 콘텐츠는 `lib/i18n.ts` 파일에 중앙집중식으로 관리되므로, 새로운 언어를 추가하거나 기존 텍스트를 수정하기가 매우 간단합니다.

## 파일 구조

```
lib/
├── i18n.ts          # 다국어 설정 및 번역 데이터
```

## i18n.ts 파일 구조

### 1. 언어 정의 (languages)

```typescript
export const languages = {
  ko: { name: "한국어", flag: "🇰🇷" },
  en: { name: "English", flag: "🇺🇸" },
} as const;
```

새로운 언어를 추가하려면 여기에 추가하면 됩니다.

### 2. 기본 언어 설정 (defaultLanguage)

```typescript
export const defaultLanguage: Language = "ko";
```

사용자가 언어를 선택하지 않았을 때 기본으로 사용할 언어를 설정합니다.

### 3. 번역 데이터 (translations)

```typescript
export const translations = {
  ko: {
    navbar: { ... },
    footer: { ... },
    home: { ... },
    budget: { ... },
  },
  en: {
    navbar: { ... },
    footer: { ... },
    home: { ... },
    budget: { ... },
  },
} as const;
```

각 언어별로 모든 텍스트를 계층적으로 구성합니다.

## 사용 방법

### 1. 컴포넌트에서 번역 사용하기

현재는 하드코딩된 한국어를 사용하고 있습니다. 나중에 다국어 지원을 활성화하려면 다음과 같이 수정하면 됩니다.

#### 예시 1: Navbar.tsx에서 사용

```typescript
import { getTranslation, defaultLanguage } from "@/lib/i18n";

const navLabels = {
  home: getTranslation(defaultLanguage, "navbar.home"),
  notices: getTranslation(defaultLanguage, "navbar.notices"),
  // ...
};
```

#### 예시 2: 페이지에서 사용

```typescript
import { getTranslation, defaultLanguage } from "@/lib/i18n";

export default function HomePage() {
  const t = (key: string) => getTranslation(defaultLanguage, key);
  
  return (
    <h1>{t("home.title")}</h1>
    <p>{t("home.description")}</p>
  );
}
```

### 2. 새로운 번역 키 추가하기

1. `lib/i18n.ts` 파일을 엽니다.
2. `translations` 객체에서 해당하는 언어와 카테고리를 찾습니다.
3. 새로운 키-값 쌍을 추가합니다.

**예시:**

```typescript
export const translations = {
  ko: {
    navbar: {
      home: "홈",
      notices: "공지사항",
      newKey: "새로운 키", // 추가
    },
    // ...
  },
  en: {
    navbar: {
      home: "Home",
      notices: "Notices",
      newKey: "New Key", // 추가
    },
    // ...
  },
};
```

### 3. 새로운 언어 추가하기

#### Step 1: 언어 정의 추가

```typescript
export const languages = {
  ko: { name: "한국어", flag: "🇰🇷" },
  en: { name: "English", flag: "🇺🇸" },
  ja: { name: "日本語", flag: "🇯🇵" }, // 새로운 언어
} as const;
```

#### Step 2: 번역 데이터 추가

```typescript
export const translations = {
  ko: { /* ... */ },
  en: { /* ... */ },
  ja: {
    navbar: {
      home: "ホーム",
      notices: "お知らせ",
      // ... 모든 키에 대한 번역
    },
    footer: {
      // ...
    },
    home: {
      // ...
    },
    budget: {
      // ...
    },
  },
} as const;
```

## 번역 구조

현재 번역은 다음과 같은 카테고리로 구성되어 있습니다:

| 카테고리 | 설명 | 예시 |
|---------|------|------|
| `navbar` | 상단 네비게이션 바 텍스트 | `navbar.home`, `navbar.notices` |
| `footer` | 하단 푸터 텍스트 | `footer.title`, `footer.contact` |
| `home` | 메인 페이지 텍스트 | `home.title`, `home.description` |
| `features` | 기능 설명 텍스트 | `features.checkFee.label` |
| `budget` | 예산 페이지 텍스트 | `budget.title`, `budget.totalIncome` |

## 다국어 UI 컴포넌트 구현 (향후)

나중에 사용자가 언어를 선택할 수 있도록 하려면, 다음과 같은 구조를 추가하면 됩니다:

### 1. 언어 선택 컴포넌트

```typescript
// components/LanguageSwitcher.tsx
"use client";

import { languages, Language } from "@/lib/i18n";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSwitcher({ currentLang }: { currentLang: Language }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (lang: Language) => {
    // URL 파라미터나 쿠키를 통해 언어 설정
    router.push(`/${lang}${pathname}`);
  };

  return (
    <div className="flex gap-2">
      {Object.entries(languages).map(([code, { name, flag }]) => (
        <button
          key={code}
          onClick={() => handleLanguageChange(code as Language)}
          className={`px-3 py-1 rounded ${currentLang === code ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          {flag} {name}
        </button>
      ))}
    </div>
  );
}
```

### 2. 언어 감지 미들웨어 (Next.js)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { languages, defaultLanguage } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 언어 코드 추출
  const pathnameHasLanguage = Object.keys(languages).some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (pathnameHasLanguage) {
    return NextResponse.next();
  }

  // 기본 언어로 리다이렉트
  return NextResponse.redirect(
    new URL(`/${defaultLanguage}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## 베스트 프랙티스

1. **번역 키 명명**: 계층적 구조를 사용하여 명확한 키 이름을 지정합니다. 예: `navbar.home`, `footer.title`
2. **일관성**: 모든 언어에서 동일한 키 구조를 유지합니다.
3. **형식 문자열**: 동적 값이 필요한 경우 `{variable}` 형식을 사용합니다. 예: `"© {year} 기계공학과 학생회"`
4. **문맥**: 같은 단어라도 문맥에 따라 다른 번역이 필요할 수 있으므로, 충분히 구체적인 키를 사용합니다.

## 예시: 영문 버전 활성화

현재 프로젝트에서 영문 버전을 완전히 활성화하려면:

1. `lib/i18n.ts`의 모든 번역이 이미 준비되어 있습니다.
2. 각 컴포넌트에서 `getTranslation()` 함수를 사용하도록 수정합니다.
3. 사용자의 언어 선택을 저장할 상태 관리 시스템(Context API, Zustand 등)을 추가합니다.
4. 언어 선택 UI를 Navbar나 Footer에 추가합니다.

---

**작성자**: Manus AI
**최종 업데이트**: 2026년 3월 24일
