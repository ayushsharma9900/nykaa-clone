'use client';

import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CloudIcon,
  BugAntIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memory: number;
  cpu: number;
  lastRestart: string;
}

interface DatabaseInfo {
  name: string;
  size: string;
  tables: number;
  connections: number;
  lastBackup: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface CacheInfo {
  type: string;
  size: string;
  hitRate: number;
  keys: number;
  memory: number;
  status: 'healthy' | 'warning';
}

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  timestamp: string;
  message: string;
  service: string;
}

const mockSystemStatus: SystemStatus[] = [
  { service: 'API Server', status: 'healthy', uptime: '15d 4h 32m', memory: 68.5, cpu: 23.1, lastRestart: '2024-02-05 10:30:00' },
  { service: 'Database', status: 'healthy', uptime: '45d 12h 15m', memory: 82.3, cpu: 45.2, lastRestart: '2024-01-05 14:20:00' },
  { service: 'Redis Cache', status: 'warning', uptime: '12d 8h 45m', memory: 91.2, cpu: 15.8, lastRestart: '2024-02-08 16:45:00' },
  { service: 'File Storage', status: 'healthy', uptime: '30d 18h 22m', memory: 45.7, cpu: 8.3, lastRestart: '2024-01-20 09:15:00' },
  { service: 'Search Engine', status: 'critical', uptime: '2d 6h 30m', memory: 95.4, cpu: 78.9, lastRestart: '2024-02-18 11:00:00' }
];

const mockDatabaseInfo: DatabaseInfo[] = [
  { name: 'primary_db', size: '2.4 GB', tables: 28, connections: 45, lastBackup: '2024-02-20 02:00:00', status: 'healthy' },
  { name: 'analytics_db', size: '856 MB', tables: 15, connections: 12, lastBackup: '2024-02-20 02:15:00', status: 'healthy' },
  { name: 'logs_db', size: '1.2 GB', tables: 8, connections: 8, lastBackup: '2024-02-20 02:30:00', status: 'warning' }
];

const mockCacheInfo: CacheInfo[] = [
  { type: 'Redis Main', size: '256 MB', hitRate: 94.2, keys: 15847, memory: 85.3, status: 'healthy' },
  { type: 'Redis Sessions', size: '64 MB', hitRate: 89.7, keys: 3241, memory: 62.1, status: 'healthy' },
  { type: 'Application Cache', size: '128 MB', hitRate: 76.4, keys: 8932, memory: 71.8, status: 'warning' }
];

const mockLogs: LogEntry[] = [
  { level: 'error', timestamp: '2024-02-20 14:45:32', message: 'Database connection timeout', service: 'API Server' },
  { level: 'warn', timestamp: '2024-02-20 14:42:15', message: 'High memory usage detected', service: 'Redis Cache' },
  { level: 'info', timestamp: '2024-02-20 14:40:00', message: 'Backup completed successfully', service: 'Database' },
  { level: 'error', timestamp: '2024-02-20 14:35:28', message: 'Search index corruption detected', service: 'Search Engine' },
  { level: 'info', timestamp: '2024-02-20 14:30:15', message: 'Scheduled maintenance started', service: 'File Storage' }
];

export default function SystemManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'cache' | 'logs' | 'maintenance'>('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'critical': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'debug': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleServiceRestart = async (serviceName: string) => {
    setIsLoading(true);
    setSelectedService(serviceName);
    
    // Simulate API call
    setTimeout(() => {
      setSystemStatus(prev => prev.map(service => 
        service.service === serviceName 
          ? { ...service, lastRestart: new Date().toISOString(), uptime: '0m' }
          : service
      ));
      setIsLoading(false);
      setSelectedService(null);
    }, 2000);
  };

  const handleCacheClear = async (cacheType: string) => {
    setIsLoading(true);
    // Simulate cache clear
    setTimeout(() => {
      setIsLoading(false);
      alert(`${cacheType} cache cleared successfully`);
    }, 1000);
  };

  const handleDatabaseOperation = async (operation: string, dbName?: string) => {
    setIsLoading(true);
    // Simulate database operation
    setTimeout(() => {
      setIsLoading(false);
      alert(`${operation} ${dbName ? `for ${dbName}` : ''} completed successfully`);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and manage system resources, databases, and maintenance tasks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-600">System Online</span>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'System Overview', icon: ServerIcon },
            { key: 'database', label: 'Database', icon: CircleStackIcon },
            { key: 'cache', label: 'Cache Management', icon: CpuChipIcon },
            { key: 'logs', label: 'System Logs', icon: DocumentTextIcon },
            { key: 'maintenance', label: 'Maintenance', icon: Cog6ToothIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* System Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {systemStatus.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={service.service} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-md border ${getStatusColor(service.status)}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{service.service}</h3>
                        <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleServiceRestart(service.service)}
                      disabled={isLoading && selectedService === service.service}
                      className="flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isLoading && selectedService === service.service ? (
                        <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <ArrowPathIcon className="h-3 w-3 mr-1" />
                      )}
                      Restart
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Memory Usage</span>
                        <span>{service.memory.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            service.memory > 90 ? 'bg-red-500' : 
                            service.memory > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${service.memory}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>CPU Usage</span>
                        <span>{service.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            service.cpu > 80 ? 'bg-red-500' : 
                            service.cpu > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${service.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-400">
                    Last restart: {new Date(service.lastRestart).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Database Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Database Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => handleDatabaseOperation('Backup')}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CloudIcon className="h-5 w-5 mr-2" />
                Full Backup
              </button>
              
              <button 
                onClick={() => handleDatabaseOperation('Optimize')}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Optimize
              </button>
              
              <button 
                onClick={() => handleDatabaseOperation('Analyze')}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Analyze
              </button>
              
              <button 
                onClick={() => handleDatabaseOperation('Health Check')}
                className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Health Check
              </button>
            </div>
          </div>

          {/* Database Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDatabaseInfo.map((db) => (
              <div key={db.name} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md border ${getStatusColor(db.status)}`}>
                      <CircleStackIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{db.name}</h3>
                      <p className="text-xs text-gray-500">{db.size}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDatabaseOperation('Backup', db.name)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Backup
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tables:</span>
                    <span className="font-medium">{db.tables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Connections:</span>
                    <span className="font-medium">{db.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Backup:</span>
                    <span className="font-medium text-xs">{new Date(db.lastBackup).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache Management Tab */}
      {activeTab === 'cache' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCacheInfo.map((cache) => (
              <div key={cache.type} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md border ${getStatusColor(cache.status)}`}>
                      <CpuChipIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{cache.type}</h3>
                      <p className="text-xs text-gray-500">{cache.size}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCacheClear(cache.type)}
                    className="flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Clear
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Hit Rate</span>
                      <span>{cache.hitRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${cache.hitRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Memory Usage</span>
                      <span>{cache.memory.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cache.memory > 85 ? 'bg-red-500' : 
                          cache.memory > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${cache.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Keys:</span>
                    <span>{cache.keys.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent System Logs</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {mockLogs.map((log, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-400">{log.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{log.service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800">View All Logs</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">System Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Regular Maintenance</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <SparklesIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">Clean Temporary Files</span>
                    </div>
                    <span className="text-xs text-gray-500">Daily</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <CircleStackIcon className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Database Optimization</span>
                    </div>
                    <span className="text-xs text-gray-500">Weekly</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <CloudIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Full System Backup</span>
                    </div>
                    <span className="text-xs text-gray-500">Weekly</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Emergency Actions</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm font-medium">Enable Maintenance Mode</span>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100">
                    <div className="flex items-center">
                      <BugAntIcon className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-sm font-medium">Debug Mode</span>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium">Restart All Services</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
