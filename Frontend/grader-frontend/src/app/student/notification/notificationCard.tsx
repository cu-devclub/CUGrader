import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function notificationCard() {
  return (
    <Card className="w-full h-20 pt-2 m-0 gap-0 overflow-hidden relative">
      <CardHeader className="pt-1">
        <h1 className="text-lg">Programming 1</h1>
      </CardHeader>
      <CardContent className="flex flex-row justify-between pl-10">
        <h2>Assignment 2</h2>
        <h2>21/12/2124</h2>
      </CardContent>
    </Card>
  );
}
