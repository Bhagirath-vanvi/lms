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

const UserGrowthChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: "New Users",
        data: data.map((item) => item.users),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `New Users: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default UserGrowthChart;
