/**
 * ORCHESTRA System, Intelligence & Provider Configuration View
 * Combines AI provider authentication status, AI playground testing harness,
 * tool registry inspection, and human supervisory governance.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  ShieldCheck,
  Server,
  Lock,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Key,
  Wrench,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useOrchestra } from '../../context/OrchestraContext';
import { AIProviderConfig } from '../../types';
import { AIPlaygroundView } from './AIPlaygroundView';
import { ToolRegistryView } from './ToolRegistryView';

type SettingsTab = 'providers' | 'playground' | 'tools' | 'governance';

export const SettingsView: React.FC = () => {
  const {
    aiProviders,
    toggleProviderActive,
    updateProviderSettings,
    governance,
    updateGovernance,
    providerStatuses,
    refreshProviderStatuses,
    modelRegistry
  } = useOrchestra();

  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const showSavedNotification = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Intelligence & System Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Frontier AI provider adapters, execution testbed, authorized tool registry, and supervisory guardrails.
          </p>
        </div>

        {savedFeedback && (
          <div className="px-3 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{savedFeedback}</span>
          </div>
        )}
      </div>

      {/* Primary Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('providers')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'providers'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Providers & Gateway</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('playground')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'playground'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Playground (Testbed)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'tools'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span>Tool Registry & Schemas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`px-3.5 py-1.5 rounded font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Supervisory Governance</span>
        </button>
      </div>

      {/* Tab: AI Playground */}
      {activeTab === 'playground' && <AIPlaygroundView />}

      {/* Tab: Tool Registry */}
      {activeTab === 'tools' && <ToolRegistryView />}

      {/* Tab: AI Providers & Gateway */}
      {activeTab === 'providers' && (
        <div className="space-y-8 animate-fade-in">
          {/* Server-Side Key Configuration Status Banner */}
          <section className="p-4 bg-[#0c121d] border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Live Server Secrets Status Matrix
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verified server-side environment secrets. Keys are never bundled into client javascript.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshProviderStatuses}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 flex items-center gap-1.5 font-mono transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-Check Secrets</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {[
                {
                  id: 'gemini',
                  envVar: 'GEMINI_API_KEY',
                  name: 'Google Gemini Frontier',
                  desc: 'Multimodal, ultra-long 2M context, native structured JSON'
                },
                {
                  id: 'groq',
                  envVar: 'GROQ_API_KEY',
                  name: 'Groq Cloud (LPU)',
                  desc: 'Ultra-low latency token generation for real-time triage'
                },
                {
                  id: 'openrouter',
                  envVar: 'OPENROUTER_API_KEY',
                  name: 'OpenRouter Gateway',
                  desc: 'Universal routing to Claude 3.5 Sonnet, GPT-4o, and DeepSeek'
                }
              ].map((prov) => {
                const stat = providerStatuses.find(s => s.providerId === prov.id);
                const isConfigured = stat?.status === 'configured';
                const isInvalid = stat?.status === 'invalid';

                return (
                  <div
                    key={prov.id}
                    className={`p-3.5 rounded border space-y-2 ${
                      isConfigured
                        ? 'bg-emerald-950/30 border-emerald-800/60'
                        : isInvalid
                        ? 'bg-rose-950/30 border-rose-800/60'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{prov.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold ${
                          isConfigured
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/80'
                            : isInvalid
                            ? 'bg-rose-900/60 text-rose-300 border border-rose-700/80'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isConfigured ? 'CONFIGURED' : isInvalid ? 'INVALID' : 'UNCONFIGURED'}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Env: <span className="text-slate-300">{prov.envVar}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {stat?.message || prov.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Provider Config Cards */}
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Interchangeable Provider Routing Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each provider adapter implements a unified interface. Switch preferred models without modifying agent business logic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-5 rounded-lg border transition-colors space-y-4 ${
                    provider.isActive
                      ? 'bg-[#0c121d] border-indigo-500/40'
                      : 'bg-[#080d15] border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-100">{provider.name}</h3>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {provider.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">{provider.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleProviderActive(provider.id);
                        showSavedNotification(`${provider.name} ${provider.isActive ? 'deactivated' : 'activated'}`);
                      }}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                        provider.isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {provider.isActive ? 'Active' : 'Standby'}
                    </button>
                  </div>

                  {/* Provider Config Controls */}
                  <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Default Model</label>
                      <select
                        value={provider.defaultModel}
                        onChange={(e) => {
                          updateProviderSettings(provider.id, { defaultModel: e.target.value });
                          showSavedNotification(`Updated default model for ${provider.name}`);
                        }}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono focus:outline-hidden"
                      >
                        {provider.availableModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                          <span>Temperature</span>
                          <span className="font-mono text-slate-200">{provider.temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={provider.temperature}
                          onChange={(e) => updateProviderSettings(provider.id, { temperature: Number(e.target.value) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Max Output Tokens</label>
                        <input
                          type="number"
                          value={provider.maxTokens}
                          onChange={(e) => updateProviderSettings(provider.id, { maxTokens: Number(e.target.value) })}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Secrets Verification Note */}
          <section className="space-y-3 pt-4 border-t border-slate-800/80 text-xs">
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Security Architecture & Secret Isolation
            </h2>
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-400 space-y-1.5 leading-relaxed">
              <p>
                ORCHESTRA executes all provider calls through the server-side proxy (<code className="font-mono text-slate-300">/api/intelligence/execute</code>). Model API credentials are read from server environment variables and never dispatched to the client browser.
              </p>
              <p className="text-[11px] text-slate-400">
                When credentials for a secondary vendor (such as Groq or OpenRouter) are not present, ORCHESTRA switches that adapter into a transparent deterministic sandbox mode with clear status reporting.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Governance & Guardrails */}
      {activeTab === 'governance' && (
        <section className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Human-in-the-Loop Governance & Autonomy Guardrails
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict supervisory constraints preventing unauthorized agent execution in high-risk commercial or production boundaries.
            </p>
          </div>

          <div className="bg-[#0c121d] border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Mandatory Sign-off for External Outreach & Communications
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Requires human operator approval before any outreach copy or executive memo is marked completed.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={governance.requireApprovalForOutreach}
                  onChange={(e) => {
                    updateGovernance({ requireApprovalForOutreach: e.target.checked });
                    showSavedNotification('Updated outreach approval policy');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Production Release & Cryptographic Key Gate
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prohibits automated publication of binaries, Helm charts, or Docker containers without physical signature check.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={governance.requireApprovalForProductionDeploy}
                  onChange={(e) => {
                    updateGovernance({ requireApprovalForProductionDeploy: e.target.checked });
                    showSavedNotification('Updated production release policy');
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Max Autonomous Step Limit per Task
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={governance.maxAutonomousStepCount}
                  onChange={(e) => {
                    updateGovernance({ maxAutonomousStepCount: Number(e.target.value) });
                    showSavedNotification('Updated step limit');
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Forces task suspension if an agent executes more than this threshold without user intervention.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Audit Trail Log Retention (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={governance.strictAuditRetentionDays}
                  onChange={(e) => {
                    updateGovernance({ strictAuditRetentionDays: Number(e.target.value) });
                    showSavedNotification('Updated log retention period');
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Immutable records retained for regulatory compliance and multi-agent attribution.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
