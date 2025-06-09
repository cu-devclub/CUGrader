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

export default function rankingBarChart() {
  const labels = [
    ">10",
    "10-20",
    "20-30",
    "30-40",
    "40-50",
    "50-60",
    "60-70",
    "70-80",
    "80-90",
    "< 90",
  ];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Score",
        data: [65, 59, 80, 81, 56, 55, 40, 30, 20, 10],
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <>
      <div className="w-180 h-80">
        <Bar data={data}></Bar>
      </div>
    </>
  );
}
