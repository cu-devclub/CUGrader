import { Progress } from "@/components/ui/progress";
import * as React from "react";

export default function useSumProgressBar() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(70), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-5 flex flex-row justify-between items-center">
      <Progress value={progress} className="h-5 w-[85%] mt-2" />
      <h2 className="mt-1">60/100</h2>
    </div>
  );
}
