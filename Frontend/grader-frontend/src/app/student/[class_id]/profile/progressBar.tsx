import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import * as React from "react";

interface Props {
  barName: string;
}

export default function ProgressBar({ barName }: Props) {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="flex flex-row space-x-8">
        <div className="flex flex-col w-[60%]">
          <h1 className="text-lg">{barName}</h1>
          <Progress value={progress} className="h-2 w-full mt-2" />
        </div>

        <div className="flex flex-col justify-center items-center">
          <h2 className="text-gray-400">30/60</h2>
          <h2 className="font-bold">15/30</h2>
        </div>

        <div className="w-30 h-10 mt-1 rounded bg-gray-200 flex flex-row justify-between items-center px-2">
          <Badge className="w-[50%] h-8 bg-primary">
            <span className="text-lg">Avg</span>
          </Badge>
          <span className="text-xl">23.5</span>
        </div>
      </div>
    </>
  );
}
