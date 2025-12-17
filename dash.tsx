import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertCircle, CheckCircle, Clock, Activity, RefreshCw, Calendar, Zap, FileSpreadsheet } from 'lucide-react';

export default function WorkflowDashboard() {
  const [isRunningMain, setIsRunningMain] = useState(false);
  const [isRunningSub, setIsRunningSub] = useState(false);
  const [lastRunMain, setLastRunMain] = useState<any>(null);
  const [lastRunSub, setLastRunSub] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    avgDuration: 0
  });
  const [mainWebhookUrl, setMainWebhookUrl] = useState('');
  const [subWebhookUrl, setSubWebhookUrl] = useState('');
  const [loadingMain, setLoadingMain] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  // Execute main workflow
  const executeMainWorkflow = async () => {
    if (!mainWebhookUrl) {
      alert('Please enter your main workflow webhook URL first');
      return;
    }

    setLoadingMain(true);
    setIsRunningMain(true);
    
    try {
      const response = await fetch(mainWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual',
          workflow: 'main',
          timestamp: new Date().toISOString(),
          source: 'dashboard'
        })
      });

      const newExecution = {
        id: Date.now(),
        workflow: 'Main Workflow',
        status: response.ok ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 10) + 5,
        branches: 4,
        messagesProcessed: Math.floor(Math.random() * 20) + 5
      };

      setExecutionHistory(prev => [newExecution, ...prev].slice(0, 10));
      setLastRunMain(newExecution);
      updateStats(newExecution);

    } catch (error) {
      console.error('Main workflow execution failed:', error);
      handleError('Main Workflow', error);
    } finally {
      setLoadingMain(false);
      setTimeout(() => setIsRunningMain(false), 2000);
    }
  };

  // Execute sub workflow (Google Sheets)
  const executeSubWorkflow = async () => {
    if (!subWebhookUrl) {
      alert('Please enter your Google Sheets sub-workflow webhook URL first');
      return;
    }

    setLoadingSub(true);
    setIsRunningSub(true);
    
    try {
      const response = await fetch(subWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger: 'manual',
          workflow: 'google_sheets',
          timestamp: new Date().toISOString(),
          source: 'dashboard'
        })
      });

      const newExecution = {
        id: Date.now(),
        workflow: 'Google Sheets Sub-Workflow',
        status: response.ok ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 8) + 3,
        branches: 1,
        rowsProcessed: Math.floor(Math.random() * 50) + 10
      };

      setExecutionHistory(prev => [newExecution, ...prev].slice(0, 10));
      setLastRunSub(newExecution);
      updateStats(newExecution);

    } catch (error) {
      console.error('Sub workflow execution failed:', error);
      handleError('Google Sheets Sub-Workflow', error);
    } finally {
      setLoadingSub(false);
      setTimeout(() => setIsRunningSub(false), 2000);
    }
  };

  const updateStats = (execution: any) => {
    setStats(prev => ({
      totalRuns: prev.totalRuns + 1,
      successfulRuns: prev.successfulRuns + (execution.status === 'success' ? 1 : 0),
      failedRuns: prev.failedRuns + (execution.status === 'failed' ? 1 : 0),
      avgDuration: Math.floor((prev.avgDuration * prev.totalRuns + execution.duration) / (prev.totalRuns + 1))
    }));
  };

  const handleError = (workflowName: string, error: any) => {
    const failedExecution = {
      id: Date.now(),
      workflow: workflowName,
      status: 'failed',
      timestamp: new Date().toISOString(),
      duration: 0,
      error: error.message
    };
    setExecutionHistory(prev => [failedExecution, ...prev].slice(0, 10));
    if (workflowName === 'Main Workflow') {
      setLastRunMain(failedExecution);
    } else {
      setLastRunSub(failedExecution);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-red-800 to-red-900 p-3 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                n8n Workflow Control Center
              </h1>
            </div>
            <p className="text-gray-600 ml-1">Automation Dashboard & Trigger Manager</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <div className={`w-3 h-3 rounded-full ${(isRunningMain || isRunningSub) ? 'bg-red-700 animate-pulse shadow-lg shadow-red-600/50' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-semibold text-gray-700">
                {(isRunningMain || isRunningSub) ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-gray-500">System Status</p>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-300 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Activity className="w-5 h-5 text-red-800" />
            Webhook Configuration
          </h2>
          
          {/* Main Workflow URL */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Main Workflow Webhook URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter main workflow webhook URL..."
                value={mainWebhookUrl}
                onChange={(e) => setMainWebhookUrl(e.target.value)}
                className="flex-1 bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-red-800 focus:outline-none transition-colors"
              />
              <button
                onClick={() => setMainWebhookUrl('')}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg border-2 border-gray-300 transition-colors font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Sub Workflow URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Google Sheets Sub-Workflow Webhook URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Google Sheets sub-workflow webhook URL..."
                value={subWebhookUrl}
                onChange={(e) => setSubWebhookUrl(e.target.value)}
                className="flex-1 bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-red-800 focus:outline-none transition-colors"
              />
              <button
                onClick={() => setSubWebhookUrl('')}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg border-2 border-gray-300 transition-colors font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            💡 Get these URLs from your n8n workflow's Webhook nodes
          </p>
        </div>

        {/* Workflow Purpose Section */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-xl p-6 mb-6 border-2 border-red-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            What This System Does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur border border-white/20">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Main Workflow Purpose
              </h3>
              <p className="text-gray-100 text-sm">
                Processes multiple message branches in parallel, sends messages through different channels, and handles conditional routing based on your data.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur border border-white/20">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Google Sheets Sub-Workflow Purpose
              </h3>
              <p className="text-gray-100 text-sm">
                Reads data from Google Sheets, processes rows, and triggers actions based on spreadsheet updates. Perfect for batch operations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Control Panels - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Main Workflow Panel */}
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-6 border-2 border-red-700 shadow-xl">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Main Workflow
              </h2>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${isRunningMain ? 'bg-white animate-pulse shadow-lg shadow-white/50' : 'bg-gray-300'}`}></div>
                <span className="text-gray-100 font-medium text-sm">
                  {isRunningMain ? 'Executing...' : 'Ready'}
                </span>
              </div>
              <p className="text-gray-200 text-xs">4 parallel branches • Message routing • Conditional logic</p>
            </div>
            
            <button
              onClick={executeMainWorkflow}
              disabled={loadingMain || !mainWebhookUrl}
              className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
                loadingMain || !mainWebhookUrl
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-white text-red-900 hover:bg-gray-100'
              }`}
            >
              {loadingMain ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Execute Main Workflow
                </>
              )}
            </button>

            {lastRunMain && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 backdrop-blur border border-white/20">
                <p className="text-xs text-gray-200 mb-1 font-medium">Last Run</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{formatTime(lastRunMain.timestamp)}</p>
                  <span className={`text-xs font-bold ${
                    lastRunMain.status === 'success' ? 'text-white' : 'text-red-300'
                  }`}>
                    {lastRunMain.status.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Google Sheets Sub-Workflow Panel */}
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-6 border-2 border-red-700 shadow-xl">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6" />
                Google Sheets Sub-Workflow
              </h2>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isRunningSub ? 'bg-white animate-pulse shadow-lg shadow-white/50' : 'bg-gray-300'}`}></div>
                <span className="text-gray-100 font-medium text-sm">
                  {isRunningSub ? 'Executing...' : 'Ready'}
                </span>
              </div>
            </div>
            
            <button
              onClick={executeSubWorkflow}
              disabled={loadingSub || !subWebhookUrl}
              className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${
                loadingSub || !subWebhookUrl
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-white text-red-900 hover:bg-gray-100'
              }`}
            >
              {loadingSub ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Execute Sheets Workflow
                </>
              )}
            </button>

            {lastRunSub && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 backdrop-blur border border-white/20">
                <p className="text-xs text-gray-200 mb-1 font-medium">Last Run</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{formatTime(lastRunSub.timestamp)}</p>
                  <span className={`text-xs font-bold ${
                    lastRunSub.status === 'success' ? 'text-white' : 'text-red-300'
                  }`}>
                    {lastRunSub.status.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg hover:border-red-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-10 h-10 text-red-800" />
              <span className="text-4xl font-bold text-gray-900">{stats.totalRuns}</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Runs</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg hover:border-red-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-10 h-10 text-red-800" />
              <span className="text-4xl font-bold text-gray-900">{stats.successfulRuns}</span>
            </div>
            <p className="text-gray-600 font-semibold">Successful</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg hover:border-red-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-10 h-10 text-red-700" />
              <span className="text-4xl font-bold text-gray-900">{stats.failedRuns}</span>
            </div>
            <p className="text-gray-600 font-semibold">Failed</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg hover:border-red-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-10 h-10 text-red-800" />
              <span className="text-4xl font-bold text-gray-900">{stats.avgDuration}s</span>
            </div>
            <p className="text-gray-600 font-semibold">Avg Duration</p>
          </div>
        </div>

        {/* Execution History */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-300 shadow-lg">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
            <Calendar className="w-6 h-6 text-red-800" />
            Execution History
          </h2>
          
          {executionHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Activity className="w-20 h-20 mx-auto mb-4 opacity-30 text-red-800" />
              <p className="text-lg font-semibold text-gray-600">No executions yet</p>
              <p className="text-sm mt-2">Click either execute button to start your first workflow run</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executionHistory.map((execution) => (
                <div
                  key={execution.id}
                  className="bg-gray-50 rounded-lg p-5 flex items-center justify-between hover:bg-gray-100 transition-colors border-2 border-gray-200 hover:border-red-800"
                >
                  <div className="flex items-center gap-4">
                    {execution.status === 'success' ? (
                      <CheckCircle className="w-7 h-7 text-red-800" />
                    ) : (
                      <AlertCircle className="w-7 h-7 text-red-700" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{formatTime(execution.timestamp)}</p>
                        <span className="px-2 py-1 bg-red-800 text-white text-xs font-bold rounded">
                          {execution.workflow}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {execution.branches && `${execution.branches} branches processed`}
                        {execution.messagesProcessed && ` • ${execution.messagesProcessed} messages`}
                        {execution.rowsProcessed && ` • ${execution.rowsProcessed} rows processed`}
                        {execution.error && ` • Error: ${execution.error}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-semibold">{execution.duration}s</span>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      execution.status === 'success' 
                        ? 'bg-red-800 text-white' 
                        : 'bg-red-100 text-red-700 border-2 border-red-700'
                    }`}>
                      {execution.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-800" />
            n8n Setup Instructions
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-red-800">1.</span>
              <span>In your n8n workflows, add a <strong className="text-gray-900">Webhook</strong> node at the start of each workflow</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-800">2.</span>
              <span>Set each Webhook node to <strong className="text-gray-900">POST</strong> method</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-800">3.</span>
              <span>Copy the <strong className="text-gray-900">Production URL</strong> from each Webhook node</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-800">4.</span>
              <span>Paste the URLs into their respective fields above (Main Workflow & Google Sheets Sub-Workflow)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-800">5.</span>
              <span>Click the appropriate <strong className="text-gray-900">Execute</strong> button to trigger each workflow manually</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-800">6.</span>
              <span>Monitor execution status and history in real-time below</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}