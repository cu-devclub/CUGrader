import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  labName: string;
  courseName: string;
  due: string;
}

export default function notificationCard({ labName, courseName, due }: Props) {
  return (
    <Card className="w-full h-20 pt-2 m-0 gap-0 overflow-hidden relative">
      <CardHeader className="pt-1">
        <h1 className="text-lg">{labName}</h1>
      </CardHeader>
      <CardContent className="flex flex-row justify-between pl-10">
        <h2>{courseName}</h2>
        <h2>{due}</h2>
      </CardContent>
    </Card>
  );
}
