import ProgressBar from "./progressBar";
import SumProgressBar from "./sumProgressBar";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function ScoreCard() {
  const t = useTranslations("profile-page");

  return (
    <>
      <Card className="w-[45%] gap-2 h-80 pt-2 border border-solid">
        <CardHeader>
          <h1 className="text-lg">{t("scoreSum")}</h1>
        </CardHeader>

        <CardContent className="flex flex-col gap-y-6">
          <div>
            <SumProgressBar />
          </div>
          <div className="flex flex-col gap-y-1">
            <ProgressBar barName={t("midterm")} />
            <ProgressBar barName={t("final")} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
