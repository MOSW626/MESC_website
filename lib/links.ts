export interface SiteLink {
  label: string;
  labelEn: string;
  url: string;
  description?: string;
  descriptionEn?: string;
  icon: string;
}

// 주요 링크 — 필요에 따라 이 파일을 직접 수정하세요
export const IMPORTANT_LINKS: SiteLink[] = [
  {
    label: "기계공학과 홈페이지",
    labelEn: "ME Department Website",
    url: "https://me.kaist.ac.kr/",
    description: "학과 공식 홈페이지",
    descriptionEn: "Official department website",
    icon: "🏫",
  },
  {
    label: "KAIST 포털",
    labelEn: "KAIST Portal",
    url: "https://portal.kaist.ac.kr/",
    description: "수강신청, 성적 확인 등",
    descriptionEn: "Course registration, grades, etc.",
    icon: "🎓",
  },
  {
    label: "총학생회",
    labelEn: "Student Association",
    url: "https://www.facebook.com/ua.kaist/",
    description: "KAIST 학부 총학생회",
    descriptionEn: "KAIST Undergraduate Association",
    icon: "🏛️",
  },
  {
    label: "학생처",
    labelEn: "Student Affairs",
    url: "https://www.kaist.ac.kr/kr/html/campus/05.html",
    description: "학생 지원 및 복지",
    descriptionEn: "Student support and welfare",
    icon: "📋",
  },
];

// 학생회 SNS/커뮤니티 링크
export const COMMUNITY_LINKS: SiteLink[] = [
  {
    label: "네이버 카페 (학습자료)",
    labelEn: "Naver Cafe (Resources)",
    url: "https://cafe.naver.com/kaistme",
    description: "강의자료, 시험족보 등",
    descriptionEn: "Lecture materials, past exams, etc.",
    icon: "📚",
  },
  {
    label: "카카오톡 오픈채팅",
    labelEn: "KakaoTalk Open Chat",
    url: "#",
    description: "학생회 공지 채널 (추후 업데이트)",
    descriptionEn: "Student council announcement channel (coming soon)",
    icon: "💬",
  },
  {
    label: "인스타그램 (학생회)",
    labelEn: "Instagram (Council)",
    url: "https://www.instagram.com/i_love_mesc/",
    description: "학생회 활동 소식",
    descriptionEn: "Student council activities",
    icon: "📸",
  },
  {
    label: "인스타그램 (학과)",
    labelEn: "Instagram (Department)",
    url: "https://www.instagram.com/kaist_me/",
    description: "기계공학과 공식 인스타그램",
    descriptionEn: "Official ME department Instagram",
    icon: "🔬",
  },
];
