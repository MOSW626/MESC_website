"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

const CALENDAR_EMBED_URL = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL || "";
const ICAL_URL = process.env.NEXT_PUBLIC_ICAL_URL || "";

export default function CalendarPage() {
  const { t } = useLanguage();
  const hasCalendar = CALENDAR_EMBED_URL.length > 0;

  function handleGoogleSubscribe() {
    if (ICAL_URL) {
      const googleCalUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(ICAL_URL)}`;
      window.open(googleCalUrl, "_blank");
    }
  }

  function handleICalDownload() {
    if (ICAL_URL) {
      window.open(ICAL_URL, "_blank");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("calendar.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("calendar.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleGoogleSubscribe}
            disabled={!ICAL_URL}
          >
            📅 {t("calendar.subscribeGoogle")}
          </Button>
          <Button
            variant="outline"
            onClick={handleICalDownload}
            disabled={!ICAL_URL}
          >
            🍎 {t("calendar.subscribeApple")}
          </Button>
        </div>
      </div>

      {hasCalendar ? (
        <div className="rounded-xl overflow-hidden border shadow-sm">
          <iframe
            src={CALENDAR_EMBED_URL}
            className="w-full"
            style={{ height: "600px", border: 0 }}
            scrolling="no"
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.setupNeeded")}</CardTitle>
            <CardDescription>{t("calendar.setupDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-6 text-sm space-y-3">
              <p className="font-semibold">설정 방법 / Setup Guide:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Google Calendar에서 학과 캘린더를 만드세요.</li>
                <li>
                  캘린더 설정 → <strong>&quot;다른 사람과 공유&quot;</strong> →{" "}
                  <strong>&quot;공개 액세스 가능&quot;</strong>으로 설정하세요.
                </li>
                <li>
                  <strong>&quot;캘린더 통합&quot;</strong> 섹션에서{" "}
                  <strong>&quot;이 캘린더 임베드&quot;</strong> URL을 복사하세요.
                </li>
                <li>
                  <code className="bg-background px-1 rounded">.env.local</code>의{" "}
                  <code className="bg-background px-1 rounded">
                    NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL
                  </code>
                  에 붙여넣으세요.
                </li>
                <li>
                  같은 섹션의 <strong>iCal 형식 URL</strong>을{" "}
                  <code className="bg-background px-1 rounded">NEXT_PUBLIC_ICAL_URL</code>
                  에 설정하세요.
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📱 {t("calendar.mobileTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>iPhone / iPad:</strong> {t("calendar.iphoneDesc")}</p>
            <p><strong>Android:</strong> {t("calendar.androidDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ℹ️ {t("calendar.infoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t("calendar.realtimeDesc")}</p>
            <p>{t("calendar.autoSync")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
