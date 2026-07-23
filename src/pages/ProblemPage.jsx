import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

// Normalizes any language string variant into standard keys
const normalizeLanguage = (lang) => {
  if (!lang) return '';
  const l = lang.toLowerCase().trim();
  if (l === 'c++' || l === 'cpp' || l === 'cplusplus') return 'cpp';
  if (l === 'java') return 'java';
  if (l === 'javascript' || l === 'js') return 'javascript';
  return l;
};

const findStarterCode = (starterCode, selectedLanguage) => {
  if (!Array.isArray(starterCode)) return "";

  const match = starterCode.find(
    sc => normalizeLanguage(sc.language) === normalizeLanguage(selectedLanguage)
  );

  return match?.boilerplateCode ?? "";
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  // ================= THEME ENGINE (Synced with Homepage) =================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('geekcode_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('geekcode_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const theme = isDarkMode ? {
    bgMain: "bg-neutral-950",
    bgCard: "bg-neutral-900",
    textMain: "text-neutral-50",
    textMuted: "text-neutral-400",
    border: "border-neutral-100",
    borderHex: "#f5f5f5",
    shadowDefault: "rgba(245,245,245,1)",
    barBg: "bg-neutral-900"
  } : {
    bgMain: "bg-[#f4f4f0]",
    bgCard: "bg-white",
    textMain: "text-neutral-900",
    textMuted: "text-neutral-500",
    border: "border-neutral-900",
    borderHex: "#171717",
    shadowDefault: "rgba(23,23,23,1)",
    barBg: "bg-white"
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = findStarterCode(response.data.starterCode, selectedLanguage);
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = findStarterCode(problem.starterCode, selectedLanguage);
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || error.response?.data || error.message || 'Internal server error'
      });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: error.response?.data?.message || error.response?.data || error.message || 'Submission failed',
        passedTestCases: 0,
        totalTestCases: 0,
      });
    } finally {
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500 dark:bg-emerald-500 dark:text-neutral-950';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500 dark:bg-amber-500 dark:text-neutral-950';
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500 dark:bg-red-500 dark:text-neutral-950';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${theme.bgMain} font-mono ${theme.textMain}`}>
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-black tracking-widest uppercase">DOWNLOADING_PROBLEM_MATRIX...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme.bgMain} font-mono ${theme.textMain} transition-colors duration-300 antialiased`}>
      
      {/* ================= TERMINAL NAVIGATION BAR ================= */}
      <nav className={`w-full ${theme.bgCard} border-b-4 ${theme.border} px-4 py-3 z-50`}>
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-emerald-500 animate-pulse"></span>
            <NavLink to="/" className="text-xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-none">
              GEEKCODE<span className="text-emerald-500 font-extrabold">.EXE</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center justify-center w-8 h-8 ${theme.bgCard} ${theme.textMain} border-2 ${theme.border} hover:bg-emerald-500 hover:text-neutral-900 focus:outline-none transition-none`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= WORKSPACE split panels ================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================= LEFT TERMINAL PANEL ================= */}
        <div className={`w-1/2 flex flex-col border-r-4 ${theme.border} ${theme.bgCard}`}>
          
          {/* Tab Selection */}
          <div className={`flex border-b-4 ${theme.border} overflow-x-auto`}>
            {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLeftTab(tab)}
                className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-none border-r-2 last:border-r-0 ${theme.border} ${
                  activeLeftTab === tab 
                    ? 'bg-emerald-500 text-neutral-900' 
                    : `${theme.textMain} hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900`
                }`}
              >
                [{tab}]
              </button>
            ))}
          </div>

          {/* Tab Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {problem && (
              <>
                {/* Description View */}
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3 pb-4 border-b-2 border-dashed border-neutral-700/50">
                      <h1 className="text-2xl font-black uppercase tracking-tight">{problem.title}</h1>
                      <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider border-2 ${theme.border} ${getDifficultyBadgeColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${theme.bgMain} ${theme.textMuted} border border-dashed border-neutral-500`}>
                        #{problem.tags}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-relaxed tracking-tight">
                      {problem.description}
                    </div>

                    <div className="pt-6 border-t-2 border-dashed border-neutral-700/50">
                      <h3 className="text-md font-black uppercase tracking-wider mb-4 text-emerald-500">// COMPILED_EXAMPLES</h3>
                      <div className="space-y-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div 
                            key={index} 
                            className={`p-4 border-2 ${theme.border} ${theme.bgMain}`}
                            style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}
                          >
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 mb-2">[STRUCT_EX_{index + 1}]</h4>
                            <div className="space-y-2 text-xs font-mono">
                              <div><strong className="text-neutral-400">INPUT_STREAM:</strong> {example.input}</div>
                              <div><strong className="text-neutral-400">EXPECTED_OUT:</strong> {example.output}</div>
                              {example.explanation && (
                                <div><strong className="text-neutral-400">TRACE_LOG:</strong> {example.explanation}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Editorial View */}
                {activeLeftTab === 'editorial' && (
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-emerald-500 mb-4">// EDITORIAL_DUMP</h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                    </div>
                  </div>
                )}

                {/* Solutions View */}
                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-emerald-500 mb-4">// DECOMPILED_SOLUTIONS</h2>
                    <div className="space-y-6">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className={`border-2 ${theme.border} ${theme.bgMain}`} style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}>
                          <div className={`bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 border-b-2 ${theme.border} flex justify-between items-center`}>
                            <span className="text-xs font-black uppercase tracking-wider">{problem?.title}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-neutral-900 font-bold uppercase">{solution?.language}</span>
                          </div>
                          <div className="p-4 overflow-x-auto">
                            <pre className="text-xs font-mono">
                              <code>{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      )) || (
                        <p className={`text-xs ${theme.textMuted} uppercase`}>
                          ⚠️ SOLUTIONS UNREADABLE. RE-RESOLVE EXECUTABLE TO BYPASS ENCRYPTION.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submissions View */}
                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-emerald-500 mb-4">// HISTORICAL_LOGS</h2>
                    <SubmissionHistory problemId={problemId} />
                  </div>
                )}

                {/* Chat AI View */}
                {activeLeftTab === 'chatAI' && (
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-emerald-500 mb-4">// PROMPT_AI_MATRIX</h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      <ChatAi problem={problem} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ================= RIGHT WORKSPACE PANEL ================= */}
        <div className={`w-1/2 flex flex-col ${theme.bgMain}`}>
          
          {/* Action Tabs */}
          <div className={`flex border-b-4 ${theme.border} ${theme.bgCard}`}>
            {['code', 'testcase', 'result'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightTab(tab)}
                className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-none border-r-2 last:border-r-0 ${theme.border} ${
                  activeRightTab === tab 
                    ? 'bg-emerald-500 text-neutral-900' 
                    : `${theme.textMain} hover:bg-neutral-800 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-900`
                }`}
              >
                [{tab}]
              </button>
            ))}
          </div>

          {/* Right Core Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Language Select Banner */}
                <div className={`flex justify-between items-center p-3 border-b-2 ${theme.border} ${theme.bgCard}`}>
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`px-3 py-1 border-2 text-xs font-black uppercase tracking-wider transition-none ${
                          selectedLanguage === lang 
                            ? 'bg-emerald-500 text-neutral-900 border-neutral-950' 
                            : `${theme.bgCard} ${theme.textMain} ${theme.border} hover:bg-neutral-800 hover:text-white`
                        }`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor Wrapper */}
                <div className="flex-1 border-b-2 border-neutral-900 dark:border-neutral-100">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    options={{
                      fontSize: 13,
                      fontFamily: 'monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      renderLineHighlight: 'all',
                      roundedSelection: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                    }}
                  />
                </div>

                {/* Console Action Bar */}
                <div className={`p-4 ${theme.bgCard} flex justify-between items-center`}>
                  <button 
                    className={`px-4 py-2 border-2 ${theme.border} text-xs font-black uppercase tracking-widest hover:bg-neutral-800 hover:text-white transition-none`}
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    SYS_CONSOLE [~]
                  </button>
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 border-2 ${theme.border} text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-neutral-900 transition-none ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={handleRun}
                      disabled={loading}
                    >
                      {loading ? 'RUNNING...' : 'COMPILE_RUN'}
                    </button>
                    <button
                      className={`px-4 py-2 border-2 ${theme.border} bg-emerald-500 text-neutral-900 text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-none ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={handleSubmitCode}
                      disabled={loading}
                    >
                      {loading ? 'SUBMITTING...' : 'PUSH_PROD'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Case Output Console */}
            {activeRightTab === 'testcase' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <h3 className="text-md font-black uppercase tracking-wider text-emerald-500">// STDOUT_TELEMETRY</h3>
                {runResult ? (
                  <div 
                    className={`border-2 ${theme.border} p-4 bg-neutral-950 text-neutral-100 font-mono`}
                    style={{ boxShadow: `4px 4px 0px 0px ${theme.borderHex}` }}
                  >
                    {runResult.success ? (
                      <div className="space-y-4">
                        <div className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                          ✓ PARAMS EVALUATION: ALL CHANNELS COMPLETED SUCCESSFUL
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] uppercase text-neutral-400 pt-2 border-t border-dashed border-neutral-800">
                          <div>RUNTIME_MS: {runResult.runtime} SEC</div>
                          <div>MEM_ALLOC: {runResult.memory} KB</div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t-2 border-dashed border-neutral-800">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="p-3 border border-neutral-800 bg-neutral-900/50 text-[11px] space-y-1">
                              <div><strong className="text-neutral-500">PARAM_IN:</strong> {tc.stdin}</div>
                              <div><strong className="text-neutral-500">PARAM_EXP:</strong> {tc.expected_output}</div>
                              <div><strong className="text-neutral-500">SYS_OUT:</strong> {tc.stdout}</div>
                              <div className="text-emerald-500 font-bold uppercase tracking-widest mt-1">✓ PASSED</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs font-black text-red-500 uppercase tracking-widest">
                          ✗ MATRIX EXCEPTION IN_STREAM FAILURES
                        </div>
                        {runResult.error && (
                          <div className="text-[11px] text-red-400 uppercase pt-2 border-t border-dashed border-neutral-800">
                            {typeof runResult.error === 'string' ? runResult.error : JSON.stringify(runResult.error)}
                          </div>
                        )}
                        <div className="space-y-3 pt-4 border-t-2 border-dashed border-neutral-800">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="p-3 border border-neutral-800 bg-neutral-900/50 text-[11px] space-y-1">
                              <div><strong className="text-neutral-500">PARAM_IN:</strong> {tc.stdin}</div>
                              <div><strong className="text-neutral-500">PARAM_EXP:</strong> {tc.expected_output}</div>
                              <div><strong className="text-neutral-500">SYS_OUT:</strong> {tc.stdout}</div>
                              <div className={tc.status_id === 3 ? 'text-emerald-500 font-bold uppercase' : 'text-red-500 font-bold uppercase'}>
                                {tc.status_id === 3 ? '✓ PASSED' : '✗ FAILED'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={`text-xs uppercase ${theme.textMuted}`}>
                    Ready for compilation interface parameters. Press "COMPILE_RUN" to test structures.
                  </p>
                )}
              </div>
            )}

            {/* Submission Evaluation Panel */}
            {activeRightTab === 'result' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <h3 className="text-md font-black uppercase tracking-wider text-emerald-500">// PROD_EVALUATION</h3>
                {submitResult ? (
                  <div 
                    className={`border-2 p-5 bg-neutral-950 font-mono ${
                      submitResult.accepted ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'
                    }`}
                    style={{ boxShadow: `6px 6px 0px 0px ${theme.borderHex}` }}
                  >
                    {submitResult.accepted ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-black uppercase tracking-widest">🎉 ACCEPTED // SESSION RESOLVED</h4>
                        <div className="space-y-2 text-xs uppercase text-neutral-300 pt-3 border-t border-dashed border-emerald-900/50">
                          <p>MATRIX PASSED: {submitResult.passedTestCases} / {submitResult.totalTestCases}</p>
                          <p>CPU EXEC TIME: {submitResult.runtime} SEC</p>
                          <p>MEM METRICS: {submitResult.memory} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-lg font-black uppercase tracking-widest text-red-500">
                          ❌ SYSTEM EXCEPTION: {typeof submitResult.error === 'string' ? submitResult.error : JSON.stringify(submitResult.error)}
                        </h4>
                        <div className="space-y-2 text-xs uppercase text-neutral-300 pt-3 border-t border-dashed border-red-950">
                          <p>MATRIX PASSED: {submitResult.passedTestCases} / {submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={`text-xs uppercase ${theme.textMuted}`}>
                    Execution metrics empty. Deploy source payload via "PUSH_PROD" command.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProblemPage;