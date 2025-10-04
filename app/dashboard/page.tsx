// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StatusCounts {
  APPLIED: number;
  INTERVIEWING: number;
  OFFER: number;
  REJECTED: number;
}

interface DashboardData {
  totalApplications: number;
  statusCounts: StatusCounts;
}

const COLORS = {
  APPLIED: "#3b82f6", // blue-500
  INTERVIEWING: "#f97316", // orange-500
  OFFER: "#22c55e", // green-500
  REJECTED: "#ef4444", // red-500
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-10">No data available.</div>;
  }
  
  const pieChartData = Object.entries(data.statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  // Custom Tooltip for Dark Mode
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 text-white p-2 border border-gray-600 rounded-md">
          <p className="label">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">My Analytics Dashboard</h1>

      {/* <<<<<<< Dark Mode ပြင်ဆင်မှု >>>>>>>>> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</h2>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{data.totalApplications}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Offers Received</h2>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{data.statusCounts.OFFER}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Interviewing</h2>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{data.statusCounts.INTERVIEWING}</p>
        </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</h2>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{data.statusCounts.REJECTED}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Application Status Distribution</h2>
        {pieChartData.length > 0 ? (
           <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
           </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No application data to display in chart.</p>
        )}
      </div>
    </main>
  );
}

