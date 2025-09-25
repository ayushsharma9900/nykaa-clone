'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CpuChipIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  responseTime: number;
}

interface TrafficData {
  timestamp: string;
  users: number;
  requests: number;
  errors: number;
  responseTime: number;
}

export default function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [realTimeData, setRealTimeData] = useState<SystemHealth>({
    cpu: 45.2,
    memory: 68.5,
    disk: 32.1,
    network: 125.3,
    uptime: 99.95,
    responseTime: 245
  });
  
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'High memory usage on server-02', timestamp: '5 minutes ago' },
    { id: 2, type: 'info', message: 'Database backup completed successfully', timestamp: '1 hour ago' },
    { id: 3, type: 'error', message: 'Failed login attempts spike detected', timestamp: '2 hours ago' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        cpu: prev.cpu + (Math.random() - 0.5) * 10,
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, prev.network + (Math.random() - 0.5) * 50),
        uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.01)),
        responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate mock traffic data
  useEffect(() => {
    const generateTrafficData = () => {
      const now = new Date();
      const data: TrafficData[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          timestamp: timestamp.toISOString(),
          users: Math.floor(Math.random() * 1000) + 100,
          requests: Math.floor(Math.random() * 5000) + 500,
          errors: Math.floor(Math.random() * 50),
          responseTime: Math.floor(Math.random() * 200) + 150
        });
      }
      
      setTrafficData(data);
    };

    generateTrafficData();
  }, [timeRange]);

  const metrics: MetricCard[] = useMemo(() => [
    {
      title: 'CPU Usage',
      value: realTimeData.cpu.toFixed(1),
      unit: '%',
      change: 2.3,
      status: realTimeData.cpu > 80 ? 'critical' : realTimeData.cpu > 60 ? 'warning' : 'good',
      icon: CpuChipIcon
    },
    {
      title: 'Memory Usage',
      value: realTimeData.memory.toFixed(1),
      unit: '%',
      change: -1.2,
      status: realTimeData.memory > 85 ? 'critical' : realTimeData.memory > 70 ? 'warning' : 'good',
      icon: ServerIcon
    },
    {
      title: 'Response Time',
      value: realTimeData.responseTime.toFixed(0),
      unit: 'ms',
      change: 8.5,
      status: realTimeData.responseTime > 500 ? 'critical' : realTimeData.responseTime > 300 ? 'warning' : 'good',
      icon: ClockIcon
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: 15.3,
      status: 'good',
      icon: UserGroupIcon
    },
    {
      title: 'Requests/sec',
      value: '145.2',
      change: -3.1,
      status: 'good',
      icon: GlobeAltIcon
    },
    {
      title: 'Uptime',
      value: realTimeData.uptime.toFixed(2),
      unit: '%',
      change: 0.05,
      status: realTimeData.uptime > 99.9 ? 'good' : realTimeData.uptime > 99 ? 'warning' : 'critical',
      icon: CheckCircleIcon
    }
  ], [realTimeData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return XCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      default: return CheckCircleIcon;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time system monitoring and analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-2xl font-semibold text-gray-900">
                    {metric.value}
                  </p>
                  {metric.unit && (
                    <span className="ml-1 text-sm text-gray-500">{metric.unit}</span>
                  )}
                </div>
                {metric.change !== undefined && (
                  <div className={`flex items-center mt-2 text-sm ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg ${getStatusColor(metric.status!)}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Resources Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">System Resources</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>CPU</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Memory</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Disk</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span>{realTimeData.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${realTimeData.cpu}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{realTimeData.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${realTimeData.memory}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disk Usage</span>
                <span>{realTimeData.disk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${realTimeData.disk}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <AlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs mt-1 opacity-75">{alert.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Traffic Analytics</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Requests: <span className="font-medium text-gray-900">
                {trafficData.reduce((sum, item) => sum + item.requests, 0).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Avg Response Time: <span className="font-medium text-gray-900">
                {Math.round(trafficData.reduce((sum, item) => sum + item.responseTime, 0) / trafficData.length)}ms
              </span>
            </div>
          </div>
        </div>

        {/* Simple traffic visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {trafficData.reduce((sum, item) => sum + item.users, 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 font-medium">Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {trafficData.reduce((sum, item) => sum + item.requests, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-medium">Total Requests</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {trafficData.reduce((sum, item) => sum + item.errors, 0)}
            </div>
            <div className="text-sm text-red-600 font-medium">Total Errors</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(100 - (trafficData.reduce((sum, item) => sum + item.errors, 0) / trafficData.reduce((sum, item) => sum + item.requests, 0)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-purple-600 font-medium">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <SparklesIcon className="h-5 w-5 mr-2" />
            Clear Cache
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <ServerIcon className="h-5 w-5 mr-2" />
            Restart Services
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Maintenance Mode
          </button>
        </div>
      </div>
    </div>
  );
}
