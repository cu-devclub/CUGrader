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

import { Bar } from "react-chartjs-2";

import RankingBarChart from "./rankingBarChart";
import ProgressBar from "./progressBar";

export default function ProflieTab() {
  return (
    <>
      <div className="w-full h-full mt-5">
        <div className="w-full h-[45%] flex flex-col pl-20 pr-8">
          <h1 className="px-4 mb-3">Score Summary</h1>
          <div className="h-full w-full flex flex-row">
            <div className="h-full w-1/2 flex flex-col gap-y-3 justify-start item-center">
              <ProgressBar barName="Total" />
              <ProgressBar barName="Midterm" />
              <ProgressBar barName="Final" />
            </div>
            <div className="h-full w-1/2 flex flex-col gap-y-3 justify-start item-center">
              {/* TODO: Add Pagination or Scroller */}
              <ProgressBar barName="Lab 1" />
              <ProgressBar barName="Lab 2" />
              <ProgressBar barName="Lab 3" />
            </div>
          </div>
        </div>

        <div className="w-full h-1/2 flex flex-col pl-20 pr-8 mt-7">
          <h1 className="px-4 mb-3">Ranking</h1>
          <div className="h-full w-full flex-row flex justify-center items-center">
            <div className="h-full w-1/3 flex flex-col items-center justify-center gap-y-5">
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>Average</h1>
                <p>70.83</p>
              </div>
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>Max</h1>
                <p>100</p>
              </div>
              <div className="w-1/3 h-15 border border-solid rounded-md flex flex-col justify-center items-center">
                <h1>S.D.</h1>
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
