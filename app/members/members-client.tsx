"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { IMPORTANT_LINKS, COMMUNITY_LINKS } from "@/lib/links";
import { ExternalLink } from "lucide-react";

interface Member {
  id: number;
  name: string;
  role: string;
  bureau: string;
  council: boolean;
  imageUrl: string | null;
  order: number;
}

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted mb-3 ring-2 ring-border group-hover:ring-primary transition-all">
        {member.imageUrl ? (
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            className="object-cover"
          />
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

  // 그룹화 로직:
  // - bureau가 비어있으면 → 회장단만
  // - bureau가 있고 council=false → 해당 국만
  // - bureau가 있고 council=true  → 회장단 + 해당 국 (2곳에 표시)
  const grouped: Record<string, Member[]> = {};

  for (const m of members) {
    const hasBureau = m.bureau && m.bureau.trim();

    // 회장단 섹션: bureau 없거나 council=true 인 경우
    if (!hasBureau || m.council) {
      if (!grouped["회장단"]) grouped["회장단"] = [];
      grouped["회장단"].push(m);
    }

    // 국 섹션: bureau가 있는 경우
    if (hasBureau) {
      const key = m.bureau.trim();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
  }

  // '회장단'을 맨 앞에, 나머지는 가나다순
  const groupOrder = Object.keys(grouped).sort((a, b) => {
    if (a === "회장단") return -1;
    if (b === "회장단") return 1;
    return a.localeCompare(b, "ko");
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 학생회 멤버 */}
      <section className="mb-14">
        <h1 className="text-3xl font-bold mb-2">{t("members.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("members.subtitle")}</p>

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
      </section>

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
