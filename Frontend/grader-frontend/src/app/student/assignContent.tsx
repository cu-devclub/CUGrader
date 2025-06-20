import { Badge } from "@/components/ui/badge";

interface Props {
  name: string;
  due: string;
}

export default function assignContent({ name, due }: Props) {
  return (
    <div className="flex justify-between border-b pb-1 mt-1">
      <div className="flex flex-col gap-y-1">
        <h1 className="text-md">{name}</h1>
        <span className="text-xs text-primary">Due: {due}</span>
      </div>
      <div>
        <Badge className="w-20 h-6 bg-gray-300 border-solid border-gray-600">
          <p className="text-xs text-gray-600"> Not Started</p>
        </Badge>
      </div>
    </div>
  );
}
