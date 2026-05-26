export interface Doc {
  id: string;
  title: string;
  content: string;
}

export interface AiNode {
  id: string;
  name: string;
  persona: string;
}

export interface Evaluation {
  nodeId: string;
  preferredDocumentId: string;
  score: number;
  reasoning: string;
  stolenIdeas: string[];
}
