'use client';

import { api } from "@/lib/api";


export default function Page() {
  async function onClick() {
    const output = await api.semesters.list();
    console.log({ output });
  }
  return (
    <>
      <button onClick={onClick}>
        ashfugy
      </button>
    </>
  );
}