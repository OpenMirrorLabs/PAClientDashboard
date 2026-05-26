import React, { useState } from 'react';
import { Plus, Trash2, Cpu, Loader2, Wand2 } from 'lucide-react';
import { AiNode } from '../types';
import { generatePersona } from '../services/geminiService';

interface Props {
  nodes: AiNode[];
  setNodes: React.Dispatch<React.SetStateAction<AiNode[]>>;
}

export default function NodeManager({ nodes, setNodes }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddNode = async () => {
    setIsGenerating(true);
    try {
      const persona = await generatePersona();
      const newNode: AiNode = {
        id: `node-${Math.random().toString(36).substring(2, 9)}`,
        name: `AI Reviewer ${nodes.length + 1}`,
        persona: persona
      };
      setNodes([...nodes, newNode]);
    } catch (error) {
      console.error("Failed to generate persona", error);
      const fallbackNode: AiNode = {
        id: `node-${Math.random().toString(36).substring(2, 9)}`,
        name: `AI Reviewer ${nodes.length + 1}`,
        persona: 'A generic software architecture reviewer.'
      };
      setNodes([...nodes, fallbackNode]);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateNode = (id: string, field: keyof AiNode, value: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Council Nodes</h2>
          <p className="text-slate-500 text-sm mt-1">Manage the AI personas that will evaluate your blueprints.</p>
        </div>
        <button 
          onClick={handleAddNode} 
          disabled={isGenerating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Auto-Generate Node
        </button>
      </div>

      {nodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No AI nodes added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {nodes.map((node) => (
            <div key={node.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4 flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={node.name}
                    onChange={(e) => updateNode(node.id, 'name', e.target.value)}
                    className="text-lg font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full transition-colors"
                    placeholder="Node Name"
                  />
                </div>
                <button 
                  onClick={() => removeNode(node.id)} 
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Node"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Instruction / Persona</label>
                <textarea
                  value={node.persona}
                  onChange={(e) => updateNode(node.id, 'persona', e.target.value)}
                  className="w-full flex-1 min-h-[120px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-slate-700 text-sm leading-relaxed"
                  placeholder="Describe the persona, biases, and priorities of this AI reviewer..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
