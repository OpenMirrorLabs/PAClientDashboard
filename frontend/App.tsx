import React, { useState } from 'react';
import { FileText, Cpu, BarChart2, Play, Loader2, LayoutTemplate } from 'lucide-react';
import { Doc, AiNode, Evaluation } from './types';
import { DEFAULT_DOCS, DEFAULT_NODES } from './constants';
import DocumentManager from './components/DocumentManager';
import NodeManager from './components/NodeManager';
import Dashboard from './components/Dashboard';
import { evaluateDocuments, generateMasterDocument } from './services/geminiService';

type Tab = 'docs' | 'nodes' | 'dashboard';

export default function App() {
  const [documents, setDocuments] = useState<Doc[]>(DEFAULT_DOCS);
  const [nodes, setNodes] = useState<AiNode[]>(DEFAULT_NODES);
  const [results, setResults] = useState<Evaluation[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('docs');
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Master Document State
  const [masterDocument, setMasterDocument] = useState<string | null>(null);
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);

  const handleEvaluate = async () => {
    if (documents.length === 0) {
      alert("Please add at least one blueprint document.");
      return;
    }
    if (nodes.length === 0) {
      alert("Please add at least one AI node.");
      return;
    }

    setIsEvaluating(true);
    setResults([]);
    setMasterDocument(null); // Reset master document on new evaluation
    setActiveTab('dashboard');

    try {
      const evalPromises = nodes.map(node => evaluateDocuments(node, documents));
      const newResults = await Promise.all(evalPromises);
      setResults(newResults);
    } catch (error) {
      console.error("Evaluation failed", error);
      alert("Evaluation failed. Please check the console and ensure your API key is valid.");
      setActiveTab('docs');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleGenerateMaster = async (winningDocId: string) => {
    const winningDoc = documents.find(d => d.id === winningDocId);
    if (!winningDoc) return;

    setIsGeneratingMaster(true);
    try {
      const masterContent = await generateMasterDocument(winningDoc, results);
      setMasterDocument(masterContent);
    } catch (error) {
      console.error("Failed to generate master document", error);
      alert("Failed to generate master document. Please check the console.");
    } finally {
      setIsGeneratingMaster(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-3 tracking-tight">
            <LayoutTemplate className="w-8 h-8" />
            Council AI
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">Blueprint Evaluation Engine</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'docs' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'docs' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Blueprints
            <span className="ml-auto bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs">{documents.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('nodes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'nodes' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Cpu className={`w-5 h-5 ${activeTab === 'nodes' ? 'text-indigo-600' : 'text-slate-400'}`} />
            AI Council
            <span className="ml-auto bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs">{nodes.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart2 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Results Dashboard
            {results.length > 0 && (
              <span className="ml-auto bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs">Ready</span>
            )}
          </button>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={handleEvaluate} 
            disabled={isEvaluating || isGeneratingMaster} 
            className="w-full bg-indigo-600 text-white px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-bold text-sm"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Run Evaluation
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          {activeTab === 'docs' && (
            <DocumentManager documents={documents} setDocuments={setDocuments} />
          )}
          {activeTab === 'nodes' && (
            <NodeManager nodes={nodes} setNodes={setNodes} />
          )}
          {activeTab === 'dashboard' && (
            isEvaluating ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600 animate-in fade-in">
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">The Council is Deliberating</h2>
                <p className="text-slate-500">Analyzing {documents.length} blueprints across {nodes.length} unique AI personas...</p>
              </div>
            ) : (
              <Dashboard 
                results={results} 
                documents={documents} 
                nodes={nodes} 
                onGenerateMaster={handleGenerateMaster}
                isGeneratingMaster={isGeneratingMaster}
                masterDocument={masterDocument}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}
