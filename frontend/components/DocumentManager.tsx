import React from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Doc } from '../types';

interface Props {
  documents: Doc[];
  setDocuments: React.Dispatch<React.SetStateAction<Doc[]>>;
}

export default function DocumentManager({ documents, setDocuments }: Props) {
  const addDoc = () => {
    const newId = `doc-${Math.random().toString(36).substring(2, 9)}`;
    setDocuments([...documents, { id: newId, title: 'New Blueprint', content: '' }]);
  };

  const updateDoc = (id: string, field: keyof Doc, value: string) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDoc = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blueprints</h2>
          <p className="text-slate-500 text-sm mt-1">Add the software architecture documents you want to evaluate.</p>
        </div>
        <button 
          onClick={addDoc} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Blueprint
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No blueprints added yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {documents.map((doc, index) => (
            <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-4 flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-600 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => updateDoc(doc.id, 'title', e.target.value)}
                    className="text-xl font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full transition-colors"
                    placeholder="Blueprint Title"
                  />
                </div>
                <button 
                  onClick={() => removeDoc(doc.id)} 
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Document"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={doc.content}
                onChange={(e) => updateDoc(doc.id, 'content', e.target.value)}
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-slate-700 font-mono text-sm"
                placeholder="Paste blueprint details, architecture description, or requirements here..."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
