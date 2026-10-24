import React, { useState } from 'react';
import type { ComparisonPolicy, CaseComparisonResult } from './types/index';
import { DeterministicComparator } from './lib/comparator';
import { 
  DEMO_PROJECT, 
  DEMO_CONTRACT, 
  DEMO_IMPLEMENTATIONS, 
  DEMO_TEST_CASES, 
  DEMO_FIXTURE_OUTPUTS 
} from './fixtures/demoData';
import { EngineClient } from './services/engineClient';
import { 
  Activity, 
  Layers, 
  GitCompare, 
  FileCode, 
  ShieldAlert, 
  Cpu, 
  FileText, 
  Settings as SettingsIcon, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Server, 
  Download, 
  RefreshCw,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'comparisons' | 'testcases' | 'vault' | 'adapters' | 'reports' | 'settings'>('overview');
  const [isDemoMode] = useState<boolean>(true);
  const [engineStatus, setEngineStatus] = useState<{ checked: boolean; isConnected: boolean; message: string }>({
    checked: false,
    isConnected: false,
    message: 'Engine client initialized in standby.'
  });

  // حالة تشغيل المقارنة (Comparison Runner State)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('tc_rounding_boundary');
  const [numericTolerance, setNumericTolerance] = useState<number>(0.001);
  const [lastResult, setLastResult] = useState<CaseComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // تشغيل المقارنة الحقيقية عبر DeterministicComparator
  const handleRunComparison = () => {
    setIsComparing(true);
    setTimeout(() => {
      const fixtures = DEMO_FIXTURE_OUTPUTS[selectedCaseId];
      const testCase = DEMO_TEST_CASES.find(tc => tc.id === selectedCaseId)!;
      
      const policy: ComparisonPolicy = {
        strictStructuralEquality: true,
        numericTolerance: numericTolerance,
        ignoredPaths: ['$.metadata.calculation_timestamp'],
        nullAndMissingSemantics: 'strict'
      };

      const mismatches = DeterministicComparator.compare(fixtures.py, fixtures.rust, policy);

      const result: CaseComparisonResult = {
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        input: testCase.input,
        status: mismatches.length === 0 ? 'passed' : 'failed',
        referenceExecution: {
          implementationId: 'impl_py_legacy',
          output: fixtures.py,
          isError: false
        },
        candidateExecution: {
          implementationId: 'impl_rust_v2',
          output: fixtures.rust,
          isError: false
        },
        mismatches: mismatches
      };

      setLastResult(result);
      setIsComparing(false);
    }, 300);
  };

  // فحص الاتصال بمحرك البايثون المستقل
  const checkEngineConnection = async () => {
    const client = new EngineClient('http://127.0.0.1:8765/api/v1');
    const status = await client.checkHealth();
    setEngineStatus({
      checked: true,
      isConnected: status.isConnected,
      message: status.error || 'Standalone Python Engine connected successfully!'
    });
  };

  // تصدير التقرير بصيغة JSON
  const handleExportJson = () => {
    const reportData = {
      product: 'ParityForge',
      mode: isDemoMode ? 'DEMO_MODE (Deterministic Fixtures)' : 'ENGINE_CONNECTED',
      generatedAt: new Date().toISOString(),
      project: DEMO_PROJECT,
      contract: DEMO_CONTRACT,
      lastRun: lastResult
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parityforge-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* 🧭 الشريط الجانبي (Sidebar) */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        flexShrink: 0
      }}>
        {/* اللوجو والهوية */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '0 8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <GitCompare size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>ParityForge</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cross-Lang Verifier</p>
          </div>
        </div>

        {/* روابط التنقل الـ 8 */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'projects', label: 'Projects', icon: Layers },
            { id: 'comparisons', label: 'Comparisons', icon: GitCompare },
            { id: 'testcases', label: 'Test Cases', icon: FileCode },
            { id: 'vault', label: 'Failure Vault', icon: ShieldAlert },
            { id: 'adapters', label: 'Language Adapters', icon: Cpu },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'settings', label: 'Settings', icon: SettingsIcon }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--cyan-accent)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* مؤشر هوية المطور والجيتهاب */}
        <div style={{
          padding: '12px',
          background: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Maintainer</span>
            <a 
              href="https://github.com/EngJoDev" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--cyan-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              @EngJoDev <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </aside>

      {/* 🖥️ منطقة المحتوى الرئيسية */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* الشريط العلوي (Top Nav) */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Project:</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              {DEMO_PROJECT.name}
            </span>
          </div>

          {/* مؤشر بيئة التشغيل الصارم (Engineering Truthfulness) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '11px',
              color: 'var(--cyan-accent)',
              fontWeight: 600
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan-accent)' }} />
              DEMO MODE (Deterministic Fixtures)
            </div>
          </div>
        </header>

        {/* محتوى الصفحة الحالي */}
        <div style={{ padding: '28px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          
          {/* 📊 TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Verification Overview</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cross-language equivalence metrics for active contract suites.</p>
              </div>

              {/* بطاقات الإحصائيات الأربعة */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Total Verified Runs', value: '42', icon: Activity, color: 'var(--cyan-accent)' },
                  { label: 'Passed Invariants', value: '38', icon: CheckCircle2, color: 'var(--emerald-pass)' },
                  { label: 'Behavioral Mismatches', value: '4', icon: XCircle, color: 'var(--rose-fail)' },
                  { label: 'Active Adapters', value: '2 / 9', icon: Cpu, color: 'var(--amber-warn)' }
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '18px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</span>
                      <stat.icon size={16} color={stat.color} />
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Seeded demo metrics</span>
                  </div>
                ))}
              </div>

              {/* بطاقة العقد النشط وزر الانتقال للمقارنة */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--cyan-accent)', textTransform: 'uppercase', fontWeight: 700 }}>Active Contract</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{DEMO_CONTRACT.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px' }}>
                      {DEMO_CONTRACT.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('comparisons')}
                    style={{
                      background: 'var(--cyan-accent)',
                      color: '#000',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Play size={14} /> Run Comparison
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⚡ TAB 2: COMPARISONS RUNNER (معالج المقارنة التفاعلي) */}
          {activeTab === 'comparisons' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Differential Test Runner</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Executing real deterministic comparison over implementation fixtures.
                </p>
              </div>

              {/* عناصر التحكم في السياسة وحالة الاختبار */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: '16px',
                alignItems: 'end'
              }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Select Test Case</label>
                  <select 
                    value={selectedCaseId} 
                    onChange={e => setSelectedCaseId(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                  >
                    {DEMO_TEST_CASES.map(tc => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Reference</label>
                  <div style={{ background: 'var(--bg-base)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--cyan-accent)', border: '1px solid var(--border-subtle)' }}>
                    Python (v3.12)
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Candidate</label>
                  <div style={{ background: 'var(--bg-base)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#f97316', border: '1px solid var(--border-subtle)' }}>
                    Rust (v1.85)
                  </div>
                </div>

                <button
                  onClick={handleRunComparison}
                  disabled={isComparing}
                  style={{
                    background: 'var(--cyan-accent)',
                    color: '#000',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Play size={14} /> {isComparing ? 'Comparing...' : 'Run Test'}
                </button>
              </div>

              {/* نتائج الفحص الفعلي الحي */}
              {lastResult ? (
                <div>
                  {/* شريط الحالة */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    background: lastResult.status === 'passed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${lastResult.status === 'passed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {lastResult.status === 'passed' ? (
                        <CheckCircle2 size={20} color="var(--emerald-pass)" />
                      ) : (
                        <XCircle size={20} color="var(--rose-fail)" />
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                          {lastResult.status === 'passed' ? 'Behavioral Equivalence Confirmed' : `Discrepancy Detected (${lastResult.mismatches.length} Mismatches)`}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Deterministic compare finished. Evaluated with tolerance ±{numericTolerance}.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleExportJson}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-strong)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} /> Export JSON
                    </button>
                  </div>

                  {/* جدول توضيح الفروقات الحسابية ومساراتها */}
                  {lastResult.mismatches.length > 0 && (
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rose-fail)', marginBottom: '12px' }}>
                        Divergence Breakdown (Mismatch Records):
                      </h4>
                      {lastResult.mismatches.map((m, idx) => (
                        <div key={idx} style={{
                          background: 'var(--bg-base)',
                          borderLeft: '3px solid var(--rose-fail)',
                          padding: '10px 14px',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <code style={{ color: 'var(--cyan-accent)', fontWeight: 600 }}>{m.path}</code>
                            <span style={{ fontSize: '10px', background: 'rgba(244, 63, 94, 0.2)', color: 'var(--rose-fail)', padding: '2px 6px', borderRadius: '4px' }}>
                              {m.category}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>{m.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* مقارنة الأكواد والمخرجات جنباً إلى جنب (Side-by-Side) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cyan-accent)' }}>Reference Output (Python)</span>
                      </div>
                      <pre style={{ fontSize: '11px', background: 'var(--bg-base)', padding: '12px', borderRadius: '6px', overflowX: 'auto', color: '#cbd5e1' }}>
                        {JSON.stringify(lastResult.referenceExecution.output, null, 2)}
                      </pre>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f97316' }}>Candidate Output (Rust)</span>
                      </div>
                      <pre style={{ fontSize: '11px', background: 'var(--bg-base)', padding: '12px', borderRadius: '6px', overflowX: 'auto', color: '#cbd5e1' }}>
                        {JSON.stringify(lastResult.candidateExecution.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)'
                }}>
                  <GitCompare size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px' }}>Click "Run Test" to execute the real comparison engine over the Price Engine fixtures.</p>
                </div>
              )}
            </div>
          )}

          {/* 🛡️ TAB 3: FAILURE VAULT */}
          {activeTab === 'vault' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Failure Vault</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Historical divergence logs and floating-point boundary defects.</p>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} color="var(--rose-fail)" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>DEFECT-2026-FLOAT-01</span>
                    <span style={{ fontSize: '11px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-fail)', padding: '2px 8px', borderRadius: '4px' }}>
                      FLOAT_PRECISION
                    </span>
                  </div>
                  <button 
                    onClick={() => { setSelectedCaseId('tc_rounding_boundary'); setActiveTab('comparisons'); }}
                    style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--cyan-accent)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Replay Case
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Observed divergence in VAT computation: Python IEEE-754 binary floating drift yields <code>41.24999999999999</code> while Rust Banker's decimal rounding evaluates to <code>41.2500</code>.
                </p>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Path: <code style={{ color: 'var(--cyan-accent)' }}>$.tax_amount</code> • Contract: <code>calculate_final_order_price</code>
                </div>
              </div>
            </div>
          )}

          {/* ⚙️ TAB 4: SETTINGS & HONEST ENGINE CONNECTION */}
          {activeTab === 'settings' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>System Settings & Engine Boundary</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Configure tolerances and honest connection to independent Python service.</p>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Numeric Comparison Policy</h3>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Floating Point Tolerance (Delta):</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={numericTolerance}
                  onChange={e => setNumericTolerance(parseFloat(e.target.value) || 0)}
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', width: '200px' }}
                />
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>Independent Engine Connection</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  The ParityForge Python execution daemon runs on Linux Mint at port 8765. In accordance with Section 2 (Critical Engineering Truthfulness), the app will never fake connectivity.
                </p>

                <button
                  onClick={checkEngineConnection}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-strong)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={14} /> Probe Engine Health
                </button>

                {engineStatus.checked && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    background: engineStatus.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${engineStatus.isConnected ? 'var(--emerald-pass)' : 'var(--amber-warn)'}`,
                    fontSize: '12px',
                    color: engineStatus.isConnected ? 'var(--emerald-pass)' : 'var(--amber-warn)'
                  }}>
                    {engineStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* أقسام الـ Roadmap الأخرى (صادقة وواضحة طبقاً للـ Spec) */}
          {['projects', 'testcases', 'adapters', 'reports'].includes(activeTab) && (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <Terminal size={32} style={{ margin: '0 auto 12px', color: 'var(--cyan-accent)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Module: {activeTab.toUpperCase()}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0' }}>
                Planned extensible module. Currently functioning through the Price Engine unified fixture contract.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}