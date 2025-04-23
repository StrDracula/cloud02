import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { auth } from '../firebase';
import { getActivityLogsByAdminId } from '../firebaseServices';

const SystemAnalyticsLogs = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const adminId = auth.currentUser?.uid;
        if (!adminId) return;
        
        const logs = await getActivityLogsByAdminId(adminId);
        setActivityLogs(logs);
        
        // Process logs for chart data
        processChartData(logs, timeRange);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        setLoading(false);
      }
    };

    fetchLogs();
  }, [timeRange]);

  const processChartData = (logs, range) => {
    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => {
      return a.timestamp?.toDate() - b.timestamp?.toDate();
    });

    // Filter by time range
    const now = new Date();
    const filteredLogs = sortedLogs.filter(log => {
      const logDate = log.timestamp?.toDate();
      if (!logDate) return false;
      
      switch (range) {
        case 'day':
          return logDate > new Date(now - 24 * 60 * 60 * 1000);
        case 'week':
          return logDate > new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return logDate > new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });

    // Aggregate data by device type or activity type
    const activityCounts = {};
    filteredLogs.forEach(log => {
      const day = log.timestamp?.toDate().toLocaleDateString();
      if (!activityCounts[day]) {
        activityCounts[day] = {
          date: day,
          userActivity: 0,
          deviceActivity: 0,
          securityEvents: 0
        };
      }
      
      // Increment based on activity type
      if (log.type === 'user') {
        activityCounts[day].userActivity++;
      } else if (log.type === 'device') {
        activityCounts[day].deviceActivity++;
      } else if (log.type === 'security') {
        activityCounts[day].securityEvents++;
      }
    });

    // Convert to array for chart
    const chartArray = Object.values(activityCounts);
    setChartData(chartArray);
  };

  const getFilteredLogs = () => {
    if (filterType === 'all') return activityLogs;
    return activityLogs.filter(log => log.type === filterType);
  };

  const renderLogItem = (log) => {
    return (
      <div key={log.id} className="p-4 mb-2 rounded-lg bg-gray-100 hover:bg-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${getLogTypeColor(log.type)}`}></div>
            <div>
              <h4 className="font-semibold">{log.description}</h4>
              <p className="text-sm text-gray-600">
                {log.timestamp?.toDate().toLocaleString() || 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="text-sm px-2 py-1 rounded bg-gray-200">
            {log.action || log.type}
          </div>
        </div>
        {log.details && (
          <div className="mt-2 text-sm text-gray-700">
            {log.details}
          </div>
        )}
      </div>
    );
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-500';
      case 'device': return 'bg-green-500';
      case 'security': return 'bg-red-500';
      case 'system': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">System Analytics & Logs</h2>
      
      {/* Analytics Chart */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Activity Overview</h3>
          <div>
            <select 
              className="border rounded-md p-2"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
        
        <div className="h-64">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="userActivity" stroke="#3b82f6" name="User Activity" />
                <Line type="monotone" dataKey="deviceActivity" stroke="#10b981" name="Device Activity" />
                <Line type="monotone" dataKey="securityEvents" stroke="#ef4444" name="Security Events" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p>No data available for the selected time range</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Logs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <div>
            <select 
              className="border rounded-md p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="user">User Activities</option>
              <option value="device">Device Activities</option>
              <option value="security">Security Events</option>
              <option value="system">System Events</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading activity logs...</p>
            </div>
          ) : getFilteredLogs().length > 0 ? (
            getFilteredLogs().map(log => renderLogItem(log))
          ) : (
            <div className="text-center py-8">
              <p>No activity logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAnalyticsLogs;