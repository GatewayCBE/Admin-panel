import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,     // ✅ REQUIRED FOR BAR
  LineElement,    // ✅ REQUIRED FOR LINE
  PointElement,
  ArcElement,     // ✅ REQUIRED FOR PIE
  Tooltip,
  Legend,
  Title
);
