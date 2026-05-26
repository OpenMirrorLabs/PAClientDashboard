import React from 'react';
import { Trophy, Cpu, Lightbulb, BarChart3, Sparkles, Loader2 } from 'lucide-react';
import { Doc, AiNode, Evaluation } from '../types';

interface Props {
  results: Evaluation[];
  documents: Doc[];
  nodes: AiNode[];
  onGenerateMaster: (winningDocId: string) => void;
  isGeneratingMaster: boolean;
  masterDocument: string | null;
}

export default function Dashboard({ results, documents, nodes, onGenerateMaster, isGeneratingMaster, masterDocument }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
        <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-slate-600">No Results Yet</h2>
        <p className="mt-2">Run an evaluation to see the council's decision.</p>
      </div>
    );
  }

  // Calculate votes
  const voteCounts: Record<string, number> = {};
  results.forEach(r => {
    voteCounts[r.preferredDocumentId] = (voteCounts[r.preferredDocumentId] || 0) + 1;
  });

  const totalVotes = results.length;

  // Find winner
  let winnerId = '';
  let maxVotes = -1;
  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      winnerId = id;
    }
  });

  const winnerDoc = documents.find(d => d.id === winnerId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Winner Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-semibold text-indigo-100 uppercase tracking-wider">Consensus Winner</h2>
          </div>
          <p className="text-3xl md:text-4xl font-bold">{winnerDoc?.title || 'Unknown Document'}</p>
        </div>
        <div className="relative z-10 text-center md:text-right bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="text-5xl font-extrabold">{maxVotes}</div>
          <div className="text-indigo-100 uppercase tracking-wider text-xs font-semibold mt-1">Out of {totalVotes} Votes</div>
        </div>
      </div>

      {/* Vote Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Vote Distribution
        </h3>
        <div className="space-y-5">
          {documents.map(doc => {
            const votes = voteCounts[doc.id] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isWinner = doc.id === winnerId;
            
            return (
              <div key={doc.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-medium ${isWinner ? 'text-indigo-700 font-bold' : 'text-slate-700'}`}>
                    {doc.title}
                  </span>
                  <span className="text-slate-500 font-medium">{votes} vote{votes !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? 'bg-indigo-500' : 'bg-slate-400'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Feedback Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Detailed Council Feedback</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {results.map(result => {
            const node = nodes.find(n => n.id === result.nodeId);
            const chosenDoc = documents.find(d => d.id === result.preferredDocumentId);
            
            return (
              <div key={result.nodeId} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-slate-800">{node?.name || 'Unknown Node'}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={node?.persona}>
                      {node?.persona}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Blueprint</span>
                  <div className="flex justify-between items-center mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">{chosenDoc?.title || 'Unknown'}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold border border-green-200">
                      Score: {result.score}/100
                    </span>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Reasoning</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {result.stolenIdeas && result.stolenIdeas.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-auto">
                    <h5 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" /> 
                      Ideas to Steal from Others
                    </h5>
                    <ul className="space-y-2">
                      {result.stolenIdeas.map((idea, idx) => (
                        <li key={idx} className="text-sm text-amber-900 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span className="leading-snug">{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Document Section */}
      <div className="pt-8 border-t border-slate-200 mt-12">
        {masterDocument ? (
          <div className="bg-slate-900 rounded-2xl p-8 text-slate-100 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">The Ultimate Master Blueprint</h2>
            </div>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
              {masterDocument}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-slate-500 mb-6 text-center max-w-lg">
              Ready to finalize? Let our Master Architect AI take the winning blueprint and seamlessly integrate all the best stolen ideas from the council into one ultimate document.
            </p>
            <button
              onClick={() => onGenerateMaster(winnerId)}
              disabled={isGeneratingMaster}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isGeneratingMaster ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Forging Master Document...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> Forge Ultimate Master Document</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
