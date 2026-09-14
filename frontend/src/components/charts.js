import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

export const chartTheme = {
  grid: 'rgba(255,255,255,0.08)',
  tick: { color: '#94a3b8', font: { size: 11, family: 'Inter' } },
  tip: { backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1, titleColor: '#fff', bodyColor: '#cbd5e1', padding: 12, cornerRadius: 12 },
  palette: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#fb7185', '#34d399', '#fbbf24'],
};

export { ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler };
