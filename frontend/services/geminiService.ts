import { GoogleGenAI, Type } from '@google/genai';
import { AiNode, Doc, Evaluation } from '../types';

// @ts-ignore - Assuming process.env is provided by the execution environment
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey, vertexai: true });

export const generatePersona = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            text: 'You are an expert system designer. Create a short, 2-3 sentence persona for a specific type of software architecture reviewer. Give them a strong specific bias (e.g., "Security Fanatic", "Cost Optimizer", "UX Champion"). Return ONLY the persona description text.'
          }
        ]
      }
    });
    return response.text || 'A pragmatic software engineer focused on balanced solutions.';
  } catch (error) {
    console.error("Failed to generate persona:", error);
    return "A pragmatic software engineer focused on balanced solutions.";
  }
};

export const evaluateDocuments = async (node: AiNode, docs: Doc[]): Promise<Evaluation> => {
  const prompt = `
Review the following software blueprints/documents.
Choose the BEST one according to your persona's biases and priorities.

Documents:
${docs.map(d => `\n--- Document ID: ${d.id} ---\nTitle: ${d.title}\nContent:\n${d.content}\n`).join('')}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }]
    },
    config: {
      systemInstruction: `You are acting as the following persona:\n${node.persona}`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          preferredDocumentId: { 
            type: Type.STRING, 
            description: "The exact ID of the chosen document from the provided list." 
          },
          score: { 
            type: Type.NUMBER, 
            description: "A score from 1 to 100 indicating how good the chosen document is based on your persona." 
          },
          reasoning: { 
            type: Type.STRING, 
            description: "Detailed explanation of why this document was chosen over the others." 
          },
          stolenIdeas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of specific good ideas, features, or concepts from the OTHER (non-chosen) documents that should be incorporated into the winning document to make it even better."
          }
        },
        required: ["preferredDocumentId", "score", "reasoning", "stolenIdeas"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from model");
  }

  const result = JSON.parse(response.text);
  
  return {
    nodeId: node.id,
    preferredDocumentId: result.preferredDocumentId,
    score: result.score,
    reasoning: result.reasoning,
    stolenIdeas: result.stolenIdeas || []
  };
};

export const generateMasterDocument = async (winningDoc: Doc, evaluations: Evaluation[]): Promise<string> => {
  const allStolenIdeas = evaluations
    .flatMap(e => e.stolenIdeas)
    .filter(idea => idea && idea.trim() !== '');

  const prompt = `
You are an elite Master Software Architect.
Your task is to take the winning software blueprint and improve it by incorporating a list of excellent ideas suggested by a council of specialized AI reviewers.

--- WINNING BLUEPRINT ---
Title: ${winningDoc.title}
Original Content:
${winningDoc.content}

--- IDEAS TO INCORPORATE ---
${allStolenIdeas.length > 0 ? allStolenIdeas.map(idea => `- ${idea}`).join('\n') : 'No additional ideas provided. Just polish the document.'}

Please rewrite the winning blueprint to seamlessly integrate these new ideas. Make it a comprehensive, well-structured, and ultimate MASTER document.
Return ONLY the markdown content of the new master document. Do not include any conversational filler.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      role: 'user',
      parts: [{ text: prompt }]
    },
    config: {
      systemInstruction: "You are an elite Master Software Architect.",
    }
  });

  if (!response.text) {
    throw new Error("Empty response from model");
  }

  return response.text;
};
