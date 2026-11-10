/**
 * ORCHESTRA AI Playground & Model Execution Testbed
 * Dedicated testing environment for operators to verify AI provider connectivity,
 * inspect token usage and latency, toggle structured JSON output schemas,
 * and differentiate live frontier inference from sandbox simulation mode.
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Code2,
  FileJson,
  Layers,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { AIProviderId, AIExecutionResponse, ModelDefinition } from '../../types/intelligence';

const PRESET_PROMPTS = [
  {
    label: 'Architecture RFC Schema Audit',
    provider: 'gemini' as AIProviderId,
    model: 'gemini-2.5-pro',
    system: 'You are Foundry, Principal Systems Architect. Inspect system contracts for breaking backward-compatibility issues.',
    prompt: 'Review an OpenAPI 3.1 schema delta where the "cluster_uuid" field was renamed to "target_identifier". Identify risk invariants and migration rollback steps.',
    useStructured: true
  },
  {
    label: 'Market Changelog Telemetry',
    provider: 'groq' as AIProviderId,
    model: 'llama-3.3-70b-versatile',
    system: 'You are Sentry, Market Intelligence Analyst. Provide concise bulleted takeaways citing factual shifts.',
    prompt: 'A competitor just released a managed ClickHouse cloud offering with tiered storage at $0.015/GB/mo. What are the key architectural and pricing risks for RelaySync?',
    useStructured: false
  },
  {
    label: 'Enterprise Prospecting Persona',
    provider: 'openrouter' as AIProviderId,
    model: 'anthropic/claude-3.5-sonnet',
    system: 'You are Vanguard, Enterprise Prospecting Liaison. Author high-conviction, technical executive memos.',
    prompt: 'Synthesize a tailored outreach memo for the VP of Cloud Infrastructure at a mid-market fintech running 400 EKS nodes with unmanaged Spot instance interruptions.',
    useStructured: false
  }
];

const DEFAULT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', description: 'Execution assessment code' },
    confidenceScore: { type: 'number', description: 'Confidence between 0.0 and 1.0' },
    summary: { type: 'string', description: 'Executive technical summary' },
    findings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key architectural or commercial findings'
    },
    recommendedAction: { type: 'string', description: 'Immediate operational next step' }
  },
  required: ['status', 'confidenceScore', 'summary', 'findings', 'recommendedAction']
};

export const AIPlaygroundView: React.FC = () => {
  const {
    modelRegistry,
    providerStatuses,
    refreshProviderStatuses,
    executeAIReasoning
  } = useOrchestra();

  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [systemInstruction, setSystemInstruction] = useState<string>(
    'You are an autonomous intelligence sub-routine within the ORCHESTRA enterprise platform.'
  );
  const [prompt, setPrompt] = useState<string>(
    'Analyze the cost efficiency of migrating an unattached EBS gp3 volume pool (45TB) to cold snapshot archival.'
  );
  const [temperature, setTemperature] = useState<number>(0.2);
  const [isStructuredMode, setIsStructuredMode] = useState<boolean>(false);
  const [includeMemory, setIncludeMemory] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<AIExecutionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'structured' | 'payload'>('response');

  // Update selected model when provider changes
  useEffect(() => {
    const models = modelRegistry.getModelsByProvider(selectedProvider);
    if (models.length > 0 && !models.some(m => m.modelId === selectedModel)) {
      setSelectedModel(models[0].modelId);
    }
  }, [selectedProvider, modelRegistry, selectedModel]);

  // Current provider status info
  const currentStatus = providerStatuses.find(p => p.providerId === selectedProvider);
  const availableModels = modelRegistry.getModelsByProvider(selectedProvider);
  const currentModelDef = modelRegistry.getModel(selectedModel);

  const handleExecute = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setLastResponse(null);

    try {
      const response = await executeAIReasoning({
        provider: selectedProvider,
        model: selectedModel,
        prompt: prompt.trim(),
        systemInstruction: systemInstruction.trim(),
        temperature,
        includeMemoryContext: includeMemory,
        structuredSchema: isStructuredMode ? DEFAULT_JSON_SCHEMA : undefined
      });

      setLastResponse(response);
      if (isStructuredMode && response.structuredData) {
        setActiveTab('structured');
      } else {
        setActiveTab('response');
      }
    } catch (err: any) {
      setLastResponse({
        text: '',
        provider: selectedProvider,
        model: selectedModel,
        durationMs: 0,
        isSimulated: false,
        error: err.message || 'Execution failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setSelectedProvider(preset.provider);
    setSelectedModel(preset.model);
    setSystemInstruction(preset.system);
    setPrompt(preset.prompt);
    setIsStructuredMode(preset.useStructured);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              AI Intelligence Playground & Testbed
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
              STAGE 3 ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive reasoning testbed to verify provider connections, measure inference latency, inspect token throughput, and test structured JSON outputs.
          </p>
        </div>

        {/* Live Provider Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={refreshProviderStatuses}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded transition-colors text-xs flex items-center gap-1"
            title="Refresh API Credentials Status"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Keys</span>
          </button>

          {providerStatuses.map((p) => {
            const isConfigured = p.status === 'configured';
            const isInvalid = p.status === 'invalid';
            return (
              <div
                key={p.providerId}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-mono ${
                  isConfigured
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                    : isInvalid
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
                title={p.message || p.status}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConfigured ? 'bg-emerald-400' : isInvalid ? 'bg-rose-400' : 'bg-slate-500'
                  }`}
                />
                <span className="capitalize">{p.providerId}</span>
                <span className="text-[10px] opacity-75">
                  {isConfigured ? 'LIVE' : isInvalid ? 'INVALID' : 'SIMULATED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Launcher Bar */}
      <div className="p-3 bg-[#0a0f18] border border-slate-800/80 rounded-lg flex items-center gap-3 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Test Presets:
        </span>
        <div className="flex items-center gap-2">
          {PRESET_PROMPTS.map((pr, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadPreset(pr)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-xs transition-colors whitespace-nowrap"
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Workstation: Left Config & Prompt, Right Response & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Setup & Prompt Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-[#0c121d] border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Inference Configuration
            </h2>

            {/* Provider Selector */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">AI Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {(['gemini', 'groq', 'openrouter'] as AIProviderId[]).map((pid) => {
                  const isSelected = selectedProvider === pid;
                  const stat = providerStatuses.find(s => s.providerId === pid);
                  const isLive = stat?.status === 'configured';

                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setSelectedProvider(pid)}
                      className={`p-2.5 text-left rounded border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500/80 text-white ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold capitalize">{pid}</div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1 font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span className={isLive ? 'text-emerald-400' : 'text-slate-400'}>
                          {isLive ? 'Live API' : 'Sandbox'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Model Specification</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
              >
                {availableModels.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    {m.displayName} ({m.costTier} cost)
                  </option>
                ))}
              </select>

              {currentModelDef && (
                <div className="mt-2 p-2.5 bg-slate-900/40 rounded border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                  <div className="text-slate-300 font-medium">{currentModelDef.description}</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentModelDef.capabilities.map((cap) => (
                      <span key={cap} className="px-1.5 py-0.2 bg-slate-800 rounded font-mono text-[10px] text-slate-300">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hyperparameters */}
            <div className="pt-2 border-t border-slate-800/60 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Temperature</span>
                  <span className="font-mono text-slate-200">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/40 rounded border border-slate-800/60">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                    Strict Structured JSON Output Schema
                  </span>
                  <input
                    type="checkbox"
                    checked={isStructuredMode}
                    onChange={(e) => setIsStructuredMode(e.target.checked)}
                    className="accent-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-900/40 rounded border border-slate-800/60">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    Inject Organizational Memory Records
                  </span>
                  <input
                    type="checkbox"
                    checked={includeMemory}
                    onChange={(e) => setIncludeMemory(e.target.checked)}
                    className="accent-indigo-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* System Instructions & Prompt */}
          <div className="p-5 bg-[#0c121d] border border-slate-800 rounded-lg space-y-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">System Instructions</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                placeholder="Instructions governing agent identity, tone, and constraints..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Execution Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                placeholder="Enter prompt or operational inquiry..."
              />
            </div>

            <button
              type="button"
              disabled={isRunning || !prompt.trim()}
              onClick={handleExecute}
              className={`w-full py-2.5 px-4 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-99'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Dispatching AI Reasoning Request...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute AI Reasoning Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Telemetry & Response Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Telemetry Status Bar */}
          <div className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Latency:</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {lastResponse ? `${lastResponse.durationMs} ms` : '—'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Tokens:</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {lastResponse?.tokensUsed ? `${lastResponse.tokensUsed.total} (${lastResponse.tokensUsed.prompt} in / ${lastResponse.tokensUsed.completion} out)` : '—'}
                </span>
              </div>
            </div>

            {/* Simulation vs Real Execution Badge */}
            {lastResponse && (
              <div
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border ${
                  lastResponse.isSimulated
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                }`}
              >
                {lastResponse.isSimulated ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SANDBOX SIMULATION</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LIVE API VERIFIED</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Simulation Notice Banner if Simulated */}
          {lastResponse?.isSimulated && (
            <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-md text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Operating in Deterministic Sandbox Engine</strong>
                <p className="text-[11px] text-amber-400/90 leading-relaxed">
                  {lastResponse.simulationReason || 'Provider API key is unconfigured in server environment secrets. Response was generated deterministically to validate downstream pipeline contracts without failing.'}
                </p>
              </div>
            </div>
          )}

          {/* Response Inspector Window */}
          <div className="bg-[#0b101b] border border-slate-800 rounded-lg overflow-hidden flex flex-col min-h-[480px]">
            {/* View Mode Tabs */}
            <div className="px-4 py-2.5 bg-[#0e1422] border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('response')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'response'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('structured')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'structured'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Structured JSON
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payload')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === 'payload'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inspection Payload
                </button>
              </div>

              {lastResponse && (
                <span className="font-mono text-[11px] text-slate-400">
                  {lastResponse.provider} / {lastResponse.model}
                </span>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-4 flex-1 overflow-y-auto">
              {!lastResponse && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Testbed Awaiting Query</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Select an AI provider, configure models or prompts, and click Execute to test provider latency and structured responses.
                    </p>
                  </div>
                </div>
              )}

              {isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <RotateCcw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <div className="text-xs text-slate-300 font-medium">
                    Awaiting response from {selectedProvider} ({selectedModel})...
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Enforcing retry limits and timeout policies
                  </div>
                </div>
              )}

              {lastResponse && !isRunning && (
                <>
                  {lastResponse.error && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-rose-300 text-xs mb-3 font-mono">
                      Error: {lastResponse.error}
                    </div>
                  )}

                  {activeTab === 'response' && (
                    <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                      {lastResponse.text || '(Empty text response)'}
                    </pre>
                  )}

                  {activeTab === 'structured' && (
                    <div className="space-y-3">
                      {lastResponse.structuredData ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 uppercase text-[10px] font-mono">Assessment Code</span>
                              <span className="font-mono text-indigo-400 font-semibold">{lastResponse.structuredData.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 uppercase text-[10px] font-mono">Confidence</span>
                              <span className="font-mono text-emerald-400">{lastResponse.structuredData.confidenceScore}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-800 text-slate-300">
                              <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Summary</span>
                              {lastResponse.structuredData.summary}
                            </div>
                            {lastResponse.structuredData.findings && (
                              <div className="pt-2 border-t border-slate-800">
                                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Findings</span>
                                <ul className="list-disc list-inside text-slate-300 space-y-1">
                                  {lastResponse.structuredData.findings.map((f: string, idx: number) => (
                                    <li key={idx}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
                            {JSON.stringify(lastResponse.structuredData, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic p-4 text-center">
                          No structured JSON data parsed from response. Toggle "Strict Structured JSON Output Schema" and rerun.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'payload' && (
                    <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-text">
                      {JSON.stringify(
                        {
                          request: {
                            provider: selectedProvider,
                            model: selectedModel,
                            temperature,
                            systemInstruction,
                            prompt,
                            isStructuredMode
                          },
                          response: lastResponse
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
