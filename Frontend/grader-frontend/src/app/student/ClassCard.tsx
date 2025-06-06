import React from "react";

interface Props {
  id: number;
  class_id: number;
  class_name: string;
  image: string;
}

export default function ClassCard({ class_id, class_name, image }: Props) {
  return (
    <>
      <div className="w-60 h-40 shadow rounded bg-white flex-col">
        <div className="flex border border-solid min-h-4/10 min-w-full">
          IMAGE HERE
        </div>

        <div className="flex border border-solid min-h-6/10 min-w-full flex-col bg-gray-300">
          <div className="flex justify-between border border-solid min-w-full px-4 py-2 items-center">
            <h1 className="text-md">{class_name}</h1>
            <h1 className="text-emerald-400 text-lg">2025/1</h1>
          </div>
          <div className="px-3">
            <p className="text-xs text-gray-400">{class_id}</p>
          </div>
        </div>
      </div>
    </>
  );
}
