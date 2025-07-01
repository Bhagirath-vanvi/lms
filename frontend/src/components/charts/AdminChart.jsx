"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "Users",
        data: data.map((item) => item.users),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Courses",
        data: data.map((item) => item.courses),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Enrollments",
        data: data.map((item) => item.enrollments),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.4,
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
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default AdminChart;
