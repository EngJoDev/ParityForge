export type Language = 
  | 'python' | 'rust' | 'go' | 'typescript' 
  | 'javascript' | 'c' | 'cpp' | 'java' | 'csharp';

export type AdapterStatus = 'demo_available' | 'configured' | 'connected' | 'disconnected' | 'planned';

export interface ComparisonPolicy {
  strictStructuralEquality: boolean;
  numericTolerance: number; // e.g. 0.001
  ignoredPaths: string[];   // e.g. ["$.metadata.timestamp"]
  nullAndMissingSemantics: 'strict' | 'loose';
}

export interface Contract {
  id: string;
  projectId: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  defaultPolicy: ComparisonPolicy;
  createdAt: string;
}

export interface Implementation {
  id: string;
  projectId: string;
  name: string;
  language: Language;
  version: string;
  adapterStatus: AdapterStatus;
  targetEndpoint?: string;
  lastRunAt?: string;
}

export interface TestCase {
  id: string;
  contractId: string;
  name: string;
  tags: string[];
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  description?: string;
}

export type MismatchCategory = 
  | 'TYPE_MISMATCH' 
  | 'VALUE_MISMATCH' 
  | 'MISSING_FIELD' 
  | 'EXTRA_FIELD' 
  | 'FLOAT_PRECISION' 
  | 'ERROR_MISMATCH';

export interface MismatchRecord {
  path: string;
  category: MismatchCategory;
  referenceValue: unknown;
  candidateValue: unknown;
  message: string;
}

export interface CaseComparisonResult {
  testCaseId: string;
  testCaseName: string;
  input: unknown;
  status: 'passed' | 'failed' | 'error';
  referenceExecution: {
    implementationId: string;
    output: unknown;
    isError: boolean;
  };
  candidateExecution: {
    implementationId: string;
    output: unknown;
    isError: boolean;
  };
  mismatches: MismatchRecord[];
}

export interface ComparisonRun {
  id: string;
  projectId: string;
  contractId: string;
  referenceImplId: string;
  candidateImplId: string;
  mode: 'DEMO' | 'ENGINE_CONNECTED';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  totalCases: number;
  passedCases: number;
  failedCases: number;
  results: CaseComparisonResult[];
  policyUsed: ComparisonPolicy;
  executedAt: string;
  durationMs?: number;
}