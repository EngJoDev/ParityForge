import type { Contract, Implementation, TestCase } from '../types/index';

export const DEMO_PROJECT = {
  id: 'proj_price_engine',
  name: 'Global Pricing & Tax Engine',
  slug: 'price-engine',
  description: 'Multi-currency checkout price computation with localized VAT & discounting rules.',
  languages: ['python', 'rust'] as const,
  createdAt: '2026-03-15T09:00:00Z',
};

export const DEMO_CONTRACT: Contract = {
  id: 'contract_calculate_total',
  projectId: DEMO_PROJECT.id,
  name: 'calculate_final_order_price',
  description: 'Takes raw line items, customer jurisdiction, and discount codes; returns subtotal, tax breakdown, and net total.',
  inputSchema: {
    type: 'object',
    required: ['items', 'country_code', 'currency'],
    properties: {
      items: { type: 'array' },
      country_code: { type: 'string' },
      currency: { type: 'string' }
    }
  },
  outputSchema: {
    type: 'object',
    required: ['subtotal', 'tax_amount', 'final_total', 'currency'],
    properties: {
      subtotal: { type: 'number' },
      tax_amount: { type: 'number' },
      final_total: { type: 'number' },
      currency: { type: 'string' }
    }
  },
  defaultPolicy: {
    strictStructuralEquality: true,
    numericTolerance: 0.001,
    ignoredPaths: ['$.metadata.calculation_timestamp'],
    nullAndMissingSemantics: 'strict'
  },
  createdAt: '2026-03-15T10:00:00Z'
};

export const DEMO_IMPLEMENTATIONS: Implementation[] = [
  {
    id: 'impl_py_legacy',
    projectId: DEMO_PROJECT.id,
    name: 'Python Legacy Pricing Service',
    language: 'python',
    version: 'v3.12-cpython',
    adapterStatus: 'demo_available',
    lastRunAt: '2026-04-10T14:32:00Z'
  },
  {
    id: 'impl_rust_v2',
    projectId: DEMO_PROJECT.id,
    name: 'Rust Core Engine (High-Throughput)',
    language: 'rust',
    version: 'v1.85-release',
    adapterStatus: 'demo_available',
    lastRunAt: '2026-04-10T14:32:00Z'
  }
];

export const DEMO_TEST_CASES: TestCase[] = [
  {
    id: 'tc_standard_eur',
    contractId: DEMO_CONTRACT.id,
    name: 'Standard Basket with German VAT (19%)',
    tags: ['tax', 'vat', 'standard'],
    input: {
      items: [
        { sku: 'A1', unit_price: 10.50, qty: 3 },
        { sku: 'B2', unit_price: 5.25, qty: 1 }
      ],
      country_code: 'DE',
      currency: 'EUR'
    }
  },
  {
    id: 'tc_rounding_boundary',
    contractId: DEMO_CONTRACT.id,
    name: 'Micro-discount Floating-point Rounding Edge Case',
    tags: ['edge_case', 'precision', 'rounding'],
    input: {
      items: [
        { sku: 'MICRO_1', unit_price: 0.333333, qty: 1000 }
      ],
      discount_ratio: 0.1375,
      country_code: 'EG',
      currency: 'EGP'
    }
  }
];

// مخرجات الفيكستشر للوضع التجريبي (فروقات IEEE-754 الحقيقية بين بايثون ورست)
export const DEMO_FIXTURE_OUTPUTS: Record<string, { py: unknown; rust: unknown }> = {
  tc_standard_eur: {
    py: {
      subtotal: 36.75,
      tax_amount: 6.9825,
      final_total: 43.7325,
      currency: 'EUR',
      metadata: { calculation_timestamp: 1775831520 }
    },
    rust: {
      subtotal: 36.75,
      tax_amount: 6.9825,
      final_total: 43.7325,
      currency: 'EUR',
      metadata: { calculation_timestamp: 1775831521 }
    }
  },
  tc_rounding_boundary: {
    py: {
      subtotal: 333.333333,
      tax_amount: 41.24999999999999, // Floating drift in Python
      final_total: 374.58333299999996,
      currency: 'EGP',
      metadata: { calculation_timestamp: 1775831522 }
    },
    rust: {
      subtotal: 333.333333,
      tax_amount: 41.2500, // Exact Banker's decimal rounding in Rust
      final_total: 374.5833,
      currency: 'EGP',
      metadata: { calculation_timestamp: 1775831523 }
    }
  }
};