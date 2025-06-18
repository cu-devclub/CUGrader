import ProgressBar from "./progressBar";
import SumProgressBar from "./sumProgressBar";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function scoreCard() {
  return (
    <>
      <Card className="w-[45%] gap-2 h-80 pt-2 border border-solid">
        <CardHeader>
          <h1 className="text-lg">Score summary</h1>
        </CardHeader>

        <CardContent className="flex flex-col gap-y-6">
          <div>
            <SumProgressBar />
          </div>
          <div className="flex flex-col gap-y-1">
            <ProgressBar barName="midterm" />
            <ProgressBar barName="midterm" />
            <ProgressBar barName="midterm" />
            <ProgressBar barName="midterm" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
