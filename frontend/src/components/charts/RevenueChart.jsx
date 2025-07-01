"use client";
import { Bar } from "react-chartjs-2";
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

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((item) => item.revenue),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "₹" + value,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default RevenueChart;
