import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useTranslations } from "next-intl";

interface Props {
  labName: string;
  courseName: string;
  due: string;
  maxScore: Number;
}

export default function notificationCard({
  labName,
  courseName,
  due,
  maxScore,
}: Props) {
  const t = useTranslations("notification-page");

  return (
    <Card className="w-full h-20 pt-2 m-0 gap-0 overflow-hidden relative">
      <CardHeader className="pt-1 flex flex-row justify-between">
        <h1 className="text-lg">{labName}</h1>
        <h2>
          {t("max")}: {maxScore.toString()}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-row justify-between pl-10">
        <h2>{courseName}</h2>
        <h2>{due}</h2>
      </CardContent>
    </Card>
  );
}
