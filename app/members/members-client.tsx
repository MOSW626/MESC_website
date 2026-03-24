"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { IMPORTANT_LINKS, COMMUNITY_LINKS } from "@/lib/links";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Member {
  id: number;
  name: string;
  role: string;
  bureau: string;
  council: boolean;
  imageUrl: string | null;
  order: number;
}

interface Club {
  name: string;
  nameEn: string;
  tagKo: string;
  tagEn: string;
  descKo: string;
  descEn: string;
  activitiesKo: string[];
  activitiesEn: string[];
  url: string;
  urlLabel: "site" | "insta";
  emoji: string;
  color: string;
}

const CLUBS: Club[] = [
  {
    name: "MR",
    nameEn: "MR (Microrobot Research)",
    tagKo: "로봇 연구",
    tagEn: "Robotics Research",
    descKo:
      "KAIST 유일의 로봇 동아리로, 다양한 종류의 로봇을 직접 설계하고 제작하며 연구합니다. 전공과 관계없이 로봇에 관심 있는 누구나 참여할 수 있으며, 3D 프린터·각종 공구 등 풍부한 장비를 갖춘 동아리방에서 활동합니다. 제작한 로봇으로 대회 참가와 방송 출연 등 활발한 대외 활동을 이어가고 있습니다.",
    descEn:
      "MR (Microrobot Research) is KAIST's only robot club, where members design, build, and research all kinds of robots. Open to all students regardless of major, the club provides foundational robotics education and access to 3D printers and various tools. Members actively participate in robot competitions and media appearances.",
    activitiesKo: ["로봇 설계 및 제작 프로젝트", "신입부원 기초 교육 (아두이노, 회로설계)", "대회 참가 및 방송 출연", "자체 학생 로봇 대회 운영"],
    activitiesEn: ["Robot design & fabrication projects", "Foundational education (Arduino, circuit design)", "Competition participation & media appearances", "Student robotics competition hosting"],
    url: "https://mr.kaist.ac.kr/",
    urlLabel: "site",
    emoji: "🤖",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
  },
  {
    name: "질주",
    nameEn: "ZILZU",
    tagKo: "자작자동차",
    tagEn: "Built-Car Racing",
    descKo:
      "1998년 창설된 KAIST 기계공학과 자작자동차 동아리입니다. 엔진·타이어 등 완제품을 제외한 설계, 용접, 프레임, 전기 배선까지 오프로드 경주용 자동차를 처음부터 끝까지 직접 제작합니다. 매년 KSAE 대학생 자작자동차 대회(C-Baja / E-Baja)에 참가하며 실전 엔지니어링 경험을 쌓습니다.",
    descEn:
      "ZILZU is KAIST's student-built automobile club under the Department of Mechanical Engineering, founded in 1998. Members independently design and fabricate off-road racing vehicles from scratch — handling everything from frame welding and suspension to electrical wiring. The team competes annually in the KSAE Student Built-Car Competition in both C-Baja and E-Baja categories.",
    activitiesKo: ["오프로드 경주용 자동차 설계·제작 (CAD, 정적/유동해석)", "KSAE 대학생 자작자동차 대회 참가", "C-Baja (내연기관) · E-Baja (전기차) 부문 출전", "설계부터 용접·전기 배선까지 전 과정 직접 수행"],
    activitiesEn: ["Off-road vehicle design & fabrication (CAD, FEA)", "KSAE Student Built-Car Competition", "C-Baja (combustion) & E-Baja (electric) categories", "Full in-house production: welding, wiring & more"],
    url: "https://www.instagram.com/kaist_zilzu/?hl=ko",
    urlLabel: "insta",
    emoji: "🏎️",
    color: "from-orange-500/10 to-red-500/10 border-orange-500/20",
  },
];

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted mb-3 ring-2 ring-border group-hover:ring-primary transition-all">
        {member.imageUrl ? (
          <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
            👤
          </div>
        )}
      </div>
      <p className="font-semibold text-sm">{member.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
    </div>
  );
}

export function MembersClient({ members }: { members: Member[] }) {
  const { t, lang } = useLanguage();

  // 그룹화 로직
  const grouped: Record<string, Member[]> = {};
  for (const m of members) {
    const hasBureau = m.bureau && m.bureau.trim();
    if (!hasBureau || m.council) {
      if (!grouped["회장단"]) grouped["회장단"] = [];
      grouped["회장단"].push(m);
    }
    if (hasBureau) {
      const key = m.bureau.trim();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
  }
  const groupOrder = Object.keys(grouped).sort((a, b) => {
    if (a === "회장단") return -1;
    if (b === "회장단") return 1;
    return a.localeCompare(b, "ko");
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("members.title")}</h1>
      <p className="text-muted-foreground mb-8">{t("members.subtitle")}</p>

      <Tabs defaultValue="council" className="mb-14">
        <TabsList className="mb-6">
          <TabsTrigger value="council">{t("members.tabCouncil")}</TabsTrigger>
          <TabsTrigger value="clubs">{t("members.tabClubs")}</TabsTrigger>
        </TabsList>

        {/* ── 학생회 구성원 탭 ── */}
        <TabsContent value="council">
          {members.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
              {t("members.noMembers")}
            </div>
          ) : (
            <div className="space-y-10">
              {groupOrder.map((bureauName) => (
                <div key={bureauName}>
                  <h2 className="text-lg font-bold mb-4 pb-2 border-b border-border/60 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-primary inline-block" />
                    {bureauName}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {grouped[bureauName].map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── 과동아리 탭 ── */}
        <TabsContent value="clubs">
          <p className="text-muted-foreground mb-6">{t("members.clubsSubtitle")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {CLUBS.map((club) => (
              <div
                key={club.name}
                className={`rounded-2xl border bg-gradient-to-br ${club.color} p-6 flex flex-col gap-4`}
              >
                {/* 헤더 */}
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{club.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black">{club.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border font-medium">
                        {lang === "en" ? club.tagEn : club.tagKo}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lang === "en" ? club.nameEn : club.name}
                    </p>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-sm leading-relaxed">
                  {lang === "en" ? club.descEn : club.descKo}
                </p>

                {/* 주요 활동 */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {lang === "en" ? "Key Activities" : "주요 활동"}
                  </p>
                  <ul className="space-y-1">
                    {(lang === "en" ? club.activitiesEn : club.activitiesKo).map((act) => (
                      <li key={act} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 링크 버튼 */}
                <a
                  href={club.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background/70 border hover:bg-background transition-colors text-sm font-medium w-fit"
                >
                  <ExternalLink className="h-4 w-4" />
                  {lang === "en"
                    ? (club.urlLabel === "site" ? t("members.visitSite") : t("members.visitInsta"))
                    : (club.urlLabel === "site" ? t("members.visitSite") : t("members.visitInsta"))}
                </a>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 주요 링크 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">{t("members.importantLinks")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMPORTANT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{link.icon}</span>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {lang === "en" && link.labelEn ? link.labelEn : link.label}
                </p>
                {(lang === "en" ? link.descriptionEn : link.description) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {lang === "en" ? link.descriptionEn : link.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 커뮤니티 / SNS */}
      <section>
        <h2 className="text-xl font-bold mb-4">{t("members.community")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COMMUNITY_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{link.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors flex items-center gap-1">
                  {lang === "en" && link.labelEn ? link.labelEn : link.label}
                  {link.url !== "#" && (
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
                  )}
                </p>
                {(lang === "en" ? link.descriptionEn : link.description) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {lang === "en" ? link.descriptionEn : link.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
