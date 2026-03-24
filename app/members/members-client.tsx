"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { IMPORTANT_LINKS, COMMUNITY_LINKS } from "@/lib/links";
import { ExternalLink } from "lucide-react";

interface Member {
  id: number;
  name: string;
  role: string;
  imageUrl: string | null;
  order: number;
}

export function MembersClient({ members }: { members: Member[] }) {
  const { t, lang } = useLanguage();

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center text-center group">
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
