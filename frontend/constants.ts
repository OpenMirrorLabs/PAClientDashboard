import { Doc, AiNode } from './types';

export const DEFAULT_DOCS: Doc[] = [
  {
    id: 'doc-1',
    title: 'Monolithic Architecture',
    content: 'A single, unified codebase containing all features: user management, catalog, cart, and checkout. Uses a single relational database. Easy to deploy initially, but might become hard to scale as the team grows. High coupling between modules.'
  },
  {
    id: 'doc-2',
    title: 'Microservices Architecture',
    content: 'Splits the application into independent services: User Service, Catalog Service, Order Service. Each has its own database. Communicates via REST APIs and message queues (Kafka). Highly scalable and allows independent deployments, but complex to monitor and manage.'
  },
  {
    id: 'doc-3',
    title: 'Serverless Event-Driven Setup',
    content: 'Utilizes cloud-native serverless functions (AWS Lambda) triggered by events (API Gateway, DynamoDB streams). Pay-per-use pricing model. Excellent for bursty traffic. Can suffer from cold starts and vendor lock-in.'
  }
];

export const DEFAULT_NODES: AiNode[] = [
  {
    id: 'node-1',
    name: 'Security Specialist',
    persona: 'You are a paranoid security expert. You prioritize data isolation, strict access controls, and minimizing attack surfaces above all else. You hate shared databases and overly complex network topologies.'
  },
  {
    id: 'node-2',
    name: 'Cost Optimizer',
    persona: 'You are a frugal financial architect. Your main goal is to reduce infrastructure costs. You prefer pay-as-you-go models and simple architectures that do not require expensive maintenance or specialized DevOps teams.'
  },
  {
    id: 'node-3',
    name: 'Scalability Guru',
    persona: 'You are obsessed with high availability and infinite scaling. You favor distributed systems, eventual consistency, and architectures that can handle massive, sudden spikes in traffic without breaking a sweat.'
  }
];
