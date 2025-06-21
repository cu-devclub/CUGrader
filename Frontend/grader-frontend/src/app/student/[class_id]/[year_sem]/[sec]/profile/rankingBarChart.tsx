import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ChartOptions,
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

export default function rankingBarChart() {
  const labels = [
    ">90",
    "80-90",
    "70-80",
    "60-70",
    "50-60",
    "40-50",
    "30-40",
    "20-30",
    "10-20",
    "<10",
  ];

  const scores = [1, 2, 3, 4, 5, 5, 8, 8, 5, 8];
  const maxDots = Math.max(...scores);

  const datasets = Array.from({ length: maxDots }).map((_, layerIndex) => ({
    label: `dot-layer-${layerIndex}`,
    data: scores.map((score) => (score > layerIndex ? 1 : 0)),

    borderRadius: 999,
    barThickness: 50,
    stack: "dotStack",
  }));

  const data = {
    labels,
    datasets,
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "x",
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { size: 10 },
        },
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: {
          display: false,
          stepSize: 1,
        },
        beginAtZero: true,
        max: maxDots + 1, // to prevent top clipping
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <>
      <div className="w-180 h-80">
        <Bar data={data} options={options}></Bar>
      </div>
    </>
  );
}
