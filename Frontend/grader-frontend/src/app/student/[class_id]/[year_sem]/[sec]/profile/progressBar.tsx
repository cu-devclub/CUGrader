import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface Props {
  barName: string;
}

export default function progressBar({ barName }: Props) {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="w-full h-1/4 flex justify-center">
        <div className="h-full w-[80%] flex justify-center flex-col">
          <h1 className="px-4">{barName}</h1>
          <Progress value={progress} className="h-5 w-[60%]" />
        </div>
      </div>
    </>
  );
}
