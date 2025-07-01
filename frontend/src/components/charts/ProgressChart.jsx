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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressChart = ({ data = [] }) => {
  // Provide default data if empty
  const defaultData = [
    { month: "Jan", hoursLearned: 0 },
    { month: "Feb", hoursLearned: 0 },
    { month: "Mar", hoursLearned: 0 },
    { month: "Apr", hoursLearned: 0 },
    { month: "May", hoursLearned: 0 },
    { month: "Jun", hoursLearned: 0 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const chartConfig = {
    labels: chartData.map((item) => item.month),
    datasets: [
      {
        label: "Hours Learned",
        data: chartData.map((item) => item.hoursLearned),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartConfig} options={options} />
    </div>
  );
};

export default ProgressChart;
