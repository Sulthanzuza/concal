import React from 'react';

interface StatsProps {
  totalClients: number;
  totalPosts: number;
  pendingPosts: number;
  postedPosts: number;
  notPostedPosts: number;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  color: string;
}> = ({ title, value, color }) => (
  <div
    className="bg-white p-6 rounded-lg shadow-md border-l-4"
    style={{ borderLeftColor: color }}
  >
    <p className="text-sm font-medium text-gray-600">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const StatsDashboard: React.FC<StatsProps> = ({
  totalClients,
  totalPosts,
  pendingPosts,
  postedPosts,
  notPostedPosts
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <StatCard title="Clients" value={totalClients} color="#3B82F6" />
    <StatCard title="Posts" value={totalPosts} color="#6B7280" />
    <StatCard title="Pending" value={pendingPosts} color="#F59E0B" />
    <StatCard title="Posted" value={postedPosts} color="#10B981" />
    <StatCard title="Not Posted" value={notPostedPosts} color="#EF4444" />
  </div>
);

export default StatsDashboard;
