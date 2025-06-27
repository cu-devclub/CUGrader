"use client";

import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import ScoreCard from "./scoreCard";

import RankingBarChart from "./rankingBarChart";

import { useTranslations } from "next-intl";

export default function ProflieTab() {
  const t = useTranslations("profile-page");

  return (
    <>
      <div className="w-full h-full mt-5">
        <div className="w-full h-[45%] flex flex-col pl-2 pr-8">
          <div className="h-full w-full flex flex-row">
            <ScoreCard />
          </div>
        </div>

        <div className="w-full h-1/2 flex flex-col pl-2 pr-8 mt-7">
          <h1 className="px-4 mb-3">{t("ranking")}</h1>
          <div className="h-full w-full flex-row flex justify-center items-center">
            <div className="h-full w-1/3 flex flex-col items-center justify-center gap-y-5">
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>{t("avg")}</h1>
                <p>70.83</p>
              </div>
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>{t("max")}</h1>
                <p>100</p>
              </div>
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>{t("sd")}</h1>
                <p>12.41</p>
              </div>
            </div>
            <div className="h-full w-2/3">
              <RankingBarChart />
            </div>
          </div>
        </div>
      </div>
      ;
    </>
  );
}
