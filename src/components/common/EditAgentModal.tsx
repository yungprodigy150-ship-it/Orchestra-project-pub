import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Agent, AgentDepartment, AgentAutonomy } from '../../types';
import { useOrchestra } from '../../context/OrchestraContext';
import { Cpu, Wrench, Shield, Database } from 'lucide-react';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, onClose, agent }) => {
  const { updateAgent, ventures, modelRegistry, toolRegistry } = useOrchestra();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<AgentDepartment>('Research');
  const [description, setDescription] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [autonomy, setAutonomy] = useState<AgentAutonomy>('approval_required');
  const [selectedVentureIds, setSelectedVentureIds] = useState<string[]>([]);

  // Intelligence Profile fields
  const [preferredModel, setPreferredModel] = useState('gemini-2.5-flash');
  const [fallbackModel, setFallbackModel] = useState('anthropic/claude-3.5-sonnet');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [authorizedToolIds, setAuthorizedToolIds] = useState<string[]>([]);
  const [memoryAccess, setMemoryAccess] = useState<'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL'>('RESTRICTED');
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [maxRetries, setMaxRetries] = useState(2);

  const departments: AgentDepartment[] = ['Orchestration', 'Research', 'Engineering', 'Growth', 'Operations'];
  const allModels = modelRegistry.listModels();
  const allTools = toolRegistry.listTools();

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setCode(agent.code);
      setRole(agent.role);
      setDepartment(agent.department);
      setDescription(agent.description);
      setCapabilitiesInput(agent.capabilities.join(', '));
      setAutonomy(agent.autonomy);
      setSelectedVentureIds(agent.assignedVentureIds || []);

      if (agent.intelligenceProfile) {
        setPreferredModel(agent.intelligenceProfile.preferredModelId || agent.model);
        setFallbackModel(agent.intelligenceProfile.fallbackModelId || 'gemini-2.5-flash');
        setSystemInstruction(agent.intelligenceProfile.systemInstruction || '');
        setAuthorizedToolIds(agent.intelligenceProfile.authorizedToolIds || []);
        setMemoryAccess(agent.intelligenceProfile.memoryAccessLevel || 'RESTRICTED');
        setTimeoutMs(agent.intelligenceProfile.executionLimits?.timeoutMs || 30000);
        setMaxRetries(agent.intelligenceProfile.executionLimits?.maxRetries || 2);
      } else {
        setPreferredModel(agent.model);
        setSystemInstruction(agent.description);
        setAuthorizedToolIds([]);
        setMemoryAccess('RESTRICTED');
      }
    }
  }, [agent]);

  if (!agent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const capabilities = capabilitiesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const preferredModelDef = modelRegistry.getModel(preferredModel);
    const resolvedProvider = (preferredModelDef?.provider || 'gemini') as any;

    updateAgent(agent.id, {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      role: role.trim(),
      department,
      description: description.trim(),
      capabilities: capabilities.length > 0 ? capabilities : agent.capabilities,
      provider: resolvedProvider,
      model: preferredModel,
      autonomy,
      assignedVentureIds: selectedVentureIds,
      intelligenceProfile: {
        operationalIdentity: `${name.trim()} (${code.trim().toUpperCase()}) - ${role.trim()}`,
        systemInstruction: systemInstruction.trim(),
        objectives: agent.intelligenceProfile?.objectives || [role.trim()],
        authorizedToolIds,
        memoryAccessLevel: memoryAccess,
        executionLimits: {
          maxTokens: 4096,
          timeoutMs,
          maxRetries,
          maxAutonomousSteps: agent.intelligenceProfile?.executionLimits?.maxAutonomousSteps || 5
        },
        preferredModelId: preferredModel,
        fallbackModelId: fallbackModel
      }
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Agent: ${agent.name} (${agent.code})`}
      description="Update operational identity, AI model preferences, system instructions, and tool permission gates."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {/* Basic Identification */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Agent Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Codename / Tag <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 uppercase font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as any)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Role / Function</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* AI Model Management */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-md space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            AI Provider & Model Registry Assignment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Preferred Model</label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-hidden"
              >
                {allModels.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    [{m.provider.toUpperCase()}] {m.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Fallback Model</label>
              <select
                value={fallbackModel}
                onChange={(e) => setFallbackModel(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-hidden"
              >
                {allModels.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    [{m.provider.toUpperCase()}] {m.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* System Instructions Directive */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            System Instructions (Reasoning Directive)
          </label>
          <textarea
            rows={3}
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-hidden focus:border-indigo-500 font-mono text-xs leading-relaxed"
            placeholder="Directives for agent reasoning constraints, tone, and guardrails..."
          />
        </div>

        {/* Authorized Tools Selection */}
        <div className="p-3 bg-slate-900/40 border border-slate-800 rounded space-y-2">
          <label className="block text-slate-300 font-medium flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Authorized Tool Permissions
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {authorizedToolIds.length} Granted
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {allTools.map((tool) => {
              const isChecked = authorizedToolIds.includes(tool.id);
              return (
                <label
                  key={tool.id}
                  className={`p-2 rounded border flex items-start gap-2 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAuthorizedToolIds([...authorizedToolIds, tool.id]);
                      } else {
                        setAuthorizedToolIds(authorizedToolIds.filter(id => id !== tool.id));
                      }
                    }}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <div>
                    <div className="font-semibold text-[11px] leading-tight">{tool.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tool.permissionLevel}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Memory & Execution Safety Guardrails */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Memory Access</label>
            <select
              value={memoryAccess}
              onChange={(e) => setMemoryAccess(e.target.value as any)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono"
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="RESTRICTED">RESTRICTED</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Timeout (ms)</label>
            <input
              type="number"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Number(e.target.value))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Max Retries</label>
            <input
              type="number"
              value={maxRetries}
              min="0"
              max="5"
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono"
            />
          </div>
        </div>

        {/* Autonomy Level */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Autonomy Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'full', label: 'Full Autonomy' },
                { id: 'approval_required', label: 'Approval Required' },
                { id: 'supervised', label: 'Supervised' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAutonomy(opt.id as AgentAutonomy)}
                className={`p-2 text-center rounded border transition-colors ${
                  autonomy === opt.id
                    ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100 font-medium'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Ventures */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Assigned Ventures</label>
          <div className="flex flex-wrap gap-2">
            {ventures.map((v) => {
              const isSelected = selectedVentureIds.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedVentureIds(selectedVentureIds.filter(id => id !== v.id));
                    } else {
                      setSelectedVentureIds([...selectedVentureIds, v.id]);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors"
          >
            Save Intelligence Profile
          </button>
        </div>
      </form>
    </Modal>
  );
};
