import { useState, useEffect, useRef, useCallback } from "react";
import Header from './components/Header';
import ResearchBriefings from './components/ResearchBriefings';
import CurationExtraction from './components/CurationExtraction';
import ResearchQueries from './components/ResearchQueries';
import ResearchStatus from './components/ResearchStatus';
import ResearchReport from './components/ResearchReport';
import ResearchForm from './components/ResearchForm';
import {ResearchOutput, EnrichmentCounts, ResearchState} from './types';
import { checkForFinalReport } from './utils/handlers';
import { 
  Zap, 
  Target, 
  Brain, 
  Sparkles, 
  ArrowUp, 
  RefreshCw, 
  Settings, 
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Define the missing ResearchStatusType
interface ResearchStatusType {
  step: string;
  message: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

if (!API_URL || !WS_URL) {
  throw new Error(
    "Environment variables VITE_API_URL and VITE_WS_URL must be set"
  );
}

// Light White & Blue Theme Configuration
const modernTheme = {
  background: {
    primary: 'bg-gradient-to-br from-white via-blue-50 to-blue-100',
    secondary: 'bg-white/80',
    accent: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10'
  },
  glass: {
    card: 'backdrop-blur-xl bg-white/80 border border-blue-200/30 shadow-xl',
    panel: 'backdrop-blur-2xl bg-white/70 border border-blue-300/40',
    input: 'backdrop-blur-sm bg-white/60 border-2 border-blue-300'
  },
  colors: {
    primary: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    error: ['#ef4444', '#f87171', '#fca5a5'],
    info: ['#3b82f6', '#60a5fa', '#93c5fd']
  }
};

// Enhanced Animation System
const animations = {
  fadeIn: 'animate-in fade-in duration-700 ease-out',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500 ease-out',
  slideDown: 'animate-in slide-in-from-top-4 duration-500 ease-out',
  scaleIn: 'animate-in zoom-in-95 duration-300 ease-out',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin'
};

// Neural Network Particle System
const useParticleSystem = (isActive: boolean) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const createParticle = (id: number) => ({
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2
    });

    const initialParticles = Array.from({ length: 20 }, (_, i) => createParticle(i));
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
        opacity: Math.sin(Date.now() * 0.001 + particle.id) * 0.3 + 0.4
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  return particles;
};

function App() {
  // Core Research State
  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ResearchStatusType | null>(null);
  const [output, setOutput] = useState<ResearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasFinalReport, setHasFinalReport] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [originalCompanyName, setOriginalCompanyName] = useState<string>("");

  // Enhanced UI State  
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
  }>>([]);

  // Research Flow State
  const [currentPhase, setCurrentPhase] = useState<'search' | 'enrichment' | 'briefing' | 'complete' | null>(null);
  const [researchProgress, setResearchProgress] = useState(0);
  const [phaseTimestamps, setPhaseTimestamps] = useState<Record<string, number>>({});
  
  // Section Expansion State
  const [expandedSections, setExpandedSections] = useState({
    queries: true,
    briefings: true,
    curation: true,
    settings: false
  });

  // Animation and Visual State
  const [loaderColor, setLoaderColor] = useState("#6366f1");
  const [isResetting, setIsResetting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasScrolledToStatus, setHasScrolledToStatus] = useState(false);

  // Research State Management
  const [researchState, setResearchState] = useState<ResearchState>({
    status: "idle",
    message: "",
    queries: [],
    streamingQueries: {},
    briefingStatus: {
      company: false,
      industry: false,
      financial: false,
      news: false
    }
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const maxReconnectAttempts = 3;
  const reconnectDelay = 2000;

  // Particle System
  const particles = useParticleSystem(isResearching);

  // Enhanced Color Cycling System
  useEffect(() => {
    if (!isResearching) return;
    
    const colorSets = {
      search: ["#6366f1", "#8b5cf6", "#a855f7"],
      enrichment: ["#10b981", "#34d399", "#6ee7b7"],
      briefing: ["#f59e0b", "#fbbf24", "#fcd34d"],
      complete: ["#ef4444", "#f87171", "#fca5a5"]
    };
    
    const currentColors = colorSets[currentPhase || 'search'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % currentColors.length;
      setLoaderColor(currentColors[currentIndex]);
    }, 1200);
    
    return () => clearInterval(interval);
  }, [isResearching, currentPhase]);

  // Progress Calculation
  useEffect(() => {
    let progress = 0;
    
    if (currentPhase === 'search') progress = 25;
    else if (currentPhase === 'enrichment') progress = 50;
    else if (currentPhase === 'briefing') progress = 75;
    else if (currentPhase === 'complete') progress = 100;
    
    // Add sub-progress based on completed briefings
    if (currentPhase === 'briefing') {
      const completedBriefings = Object.values(researchState.briefingStatus).filter(Boolean).length;
      progress += (completedBriefings / 4) * 25;
    }
    
    setResearchProgress(progress);
  }, [currentPhase, researchState.briefingStatus]);

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notification System
  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: id };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Enhanced Reset Function
  const resetResearch = useCallback(() => {
    setIsResetting(true);
    
    setTimeout(() => {
      setStatus(null);
      setOutput(null);
      setError(null);
      setIsComplete(false);
      setResearchProgress(0);
      setPhaseTimestamps({});
      setResearchState({
        status: "idle",
        message: "",
        queries: [],
        streamingQueries: {},
        briefingStatus: {
          company: false,
          industry: false,
          financial: false,
          news: false
        }
      });
      setCurrentPhase(null);
      setHasScrolledToStatus(false);
      setIsResetting(false);
      
      addNotification("Research session reset", "info");
    }, 400);
  }, [addNotification]);

  // Enhanced Scroll Function
  const scrollToStatus = useCallback(() => {
    if (!hasScrolledToStatus && statusRef.current) {
      const yOffset = -100;
      const y = statusRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setHasScrolledToStatus(true);
    }
  }, [hasScrolledToStatus]);

  // WebSocket Connection with Enhanced Error Handling
  const connectWebSocket = useCallback((jobId: string) => {
    console.log("🔌 Initializing Enhanced WebSocket connection for job:", jobId);
    
    const wsUrl = WS_URL.startsWith('wss://') || WS_URL.startsWith('ws://')
      ? `${WS_URL}/research/ws/${jobId}`
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${WS_URL}/research/ws/${jobId}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connection established");
      setReconnectAttempts(0);
      addNotification("Connected to research server", "success");
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected", { code: event.code, reason: event.reason });

      if (isResearching && !hasFinalReport) {
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => checkForFinalReport(
            jobId,
            setOutput,
            setStatus,
            setIsComplete,
            setIsResearching,
            setCurrentPhase,
            setHasFinalReport,
            pollingIntervalRef
          ), 5000);
        }

        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket(jobId);
          }, reconnectDelay);
        } else {
          addNotification("Connection lost. Checking for final report...", "warning");
        }
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error:", event);
      addNotification("Connection error occurred", "error");
    };

    ws.onmessage = (event) => {
      const rawData = JSON.parse(event.data);

      if (rawData.type === "status_update") {
        const statusData = rawData.data;

        // Enhanced Phase Management
        if (statusData.result?.step) {
          const step = statusData.result.step;
          const timestamp = Date.now();
          
          if (step === "Search" && currentPhase !== 'search') {
            setCurrentPhase('search');
            setPhaseTimestamps(prev => ({ ...prev, search: timestamp }));
            addNotification("🔍 Starting search phase", "info");
          } else if (step === "Enriching" && currentPhase !== 'enrichment') {
            setCurrentPhase('enrichment');
            setPhaseTimestamps(prev => ({ ...prev, enrichment: timestamp }));
            addNotification("🔬 Beginning data enrichment", "info");
          } else if (step === "Briefing" && currentPhase !== 'briefing') {
            setCurrentPhase('briefing');
            setPhaseTimestamps(prev => ({ ...prev, briefing: timestamp }));
            addNotification("📊 Generating briefings", "info");
          }
        }

        // Handle Completion
        if (statusData.status === "completed") {
          setCurrentPhase('complete');
          setIsComplete(true);
          setIsResearching(false);
          setPhaseTimestamps(prev => ({ ...prev, complete: Date.now() }));
          setStatus({
            step: "Complete",
            message: "Research completed successfully"
          });
          setOutput({
            summary: "",
            details: {
              report: statusData.result.report,
            },
          });
          setHasFinalReport(true);
          
          addNotification("🎉 Research completed successfully!", "success");
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }

        // Enhanced Query Handling
        if (statusData.status === "query_generating") {
          setResearchState((prev) => {
            const key = `${statusData.result.category}-${statusData.result.query_number}`;
            return {
              ...prev,
              streamingQueries: {
                ...prev.streamingQueries,
                [key]: {
                  text: statusData.result.query,
                  number: statusData.result.query_number,
                  category: statusData.result.category,
                  isComplete: false
                }
              }
            };
          });
        } else if (statusData.status === "query_generated") {
          setResearchState((prev) => {
            const key = `${statusData.result.category}-${statusData.result.query_number}`;
            const { [key]: _, ...remainingStreamingQueries } = prev.streamingQueries;
            
            return {
              ...prev,
              streamingQueries: remainingStreamingQueries,
              queries: [
                ...prev.queries,
                {
                  text: statusData.result.query,
                  number: statusData.result.query_number,
                  category: statusData.result.category,
                },
              ],
            };
          });
        }

        // Enhanced Enrichment Handling
        if (statusData.result?.step === "Enriching") {
          if (statusData.status === "category_start") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => ({
                ...prev,
                enrichmentCounts: {
                  ...prev.enrichmentCounts,
                  [category]: {
                    total: statusData.result.count || 0,
                    enriched: 0
                  }
                } as EnrichmentCounts
              }));
            }
          } else if (statusData.status === "extracted") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => {
                const currentCounts = prev.enrichmentCounts?.[category];
                if (currentCounts) {
                  return {
                    ...prev,
                    enrichmentCounts: {
                      ...prev.enrichmentCounts,
                      [category]: {
                        ...currentCounts,
                        enriched: Math.min(currentCounts.enriched + 1, currentCounts.total)
                      }
                    } as EnrichmentCounts
                  };
                }
                return prev;
              });
            }
          }
        }

        // Enhanced Briefing Handling
        if (statusData.status === "briefing_complete" && statusData.result?.category) {
          const category = statusData.result.category;
          setResearchState((prev) => ({
            ...prev,
            briefingStatus: {
              ...prev.briefingStatus,
              [category]: true
            }
          }));
          
          addNotification(`✅ ${category} briefing completed`, "success");
        }

        // Enhanced Status Updates
        if (statusData.status === "processing") {
          setIsComplete(false);
          setStatus({
            step: statusData.result?.step || "Processing",
            message: statusData.message || "Processing...",
          });
          scrollToStatus();
        } else if (statusData.status === "failed" || statusData.status === "error") {
          setError(statusData.error || statusData.message || "Research failed");
          setIsResearching(false);
          addNotification("❌ Research failed", "error");
        }

        // Report Streaming
        if (statusData.status === "report_chunk") {
          setOutput((prev) => ({
            summary: "Generating report...",
            details: {
              report: prev?.details?.report
                ? prev.details.report + statusData.result.chunk
                : statusData.result.chunk,
            },
          }));
        }
      }
    };

    wsRef.current = ws;
  }, [isResearching, hasFinalReport, reconnectAttempts, currentPhase, addNotification, scrollToStatus]);

  // Enhanced Form Submission
  const handleFormSubmit = async (formData: {
    companyName: string;
    companyUrl: string;
    companyHq: string;
    companyIndustry: string;
  }) => {
    setError(null);

    if (isComplete) {
      resetResearch();
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setHasFinalReport(false);
    setReconnectAttempts(0);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsResearching(true);
    setOriginalCompanyName(formData.companyName);
    setHasScrolledToStatus(false);
    setPhaseTimestamps({ start: Date.now() });

    addNotification(`🚀 Starting research for ${formData.companyName}`, "info");

    try {
      const url = `${API_URL}/research`;
      const formattedCompanyUrl = formData.companyUrl
        ? formData.companyUrl.startsWith('http://') || formData.companyUrl.startsWith('https://')
          ? formData.companyUrl
          : `https://${formData.companyUrl}`
        : undefined;

      const requestData = {
        company: formData.companyName,
        company_url: formattedCompanyUrl,
        industry: formData.companyIndustry || undefined,
        hq_location: formData.companyHq || undefined,
      };

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.job_id) {
        connectWebSocket(data.job_id);
      } else {
        throw new Error("No job ID received");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start research";
      setError(errorMessage);
      setIsResearching(false);
      addNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // Enhanced PDF Generation
  const handleGeneratePdf = async () => {
    if (!output || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    addNotification("📄 Generating PDF report...", "info");
    
    try {
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_content: output.details.report,
          company_name: originalCompanyName || 'research_report'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${originalCompanyName || 'research_report'}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      addNotification("✅ PDF downloaded successfully!", "success");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
      setError(errorMessage);
      addNotification(`❌ ${errorMessage}`, "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Enhanced Clipboard Function
  const handleCopyToClipboard = async () => {
    if (!output?.details?.report) return;
    
    try {
      await navigator.clipboard.writeText(output.details.report);
      setIsCopied(true);
      addNotification("📋 Report copied to clipboard!", "success");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      addNotification("❌ Failed to copy to clipboard", "error");
    }
  };

  // Toggle Functions
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced Progress Component Renderer
  const renderProgressComponents = () => {
    const components = [];

    // Research Report (Priority Display)
    if (output && output.details) {
      components.push(
        <div key="report" className={`${animations.fadeIn} transition-all duration-500`}>
          <ResearchReport
            output={{
              summary: output.summary,
              details: {
                report: output.details.report || ''
              }
            }}
            isResetting={isResetting}
            glassStyle={modernTheme.glass}
            fadeInAnimation={animations}
            loaderColor={loaderColor}
            isGeneratingPdf={isGeneratingPdf}
            isCopied={isCopied}
            onCopyToClipboard={handleCopyToClipboard}
            onGeneratePdf={handleGeneratePdf}
          />
        </div>
      );
    }

    // Dynamic Phase Components
    if (currentPhase === 'briefing' || (currentPhase === 'complete' && researchState.briefingStatus)) {
      components.push(
        <div key="briefing" className={`${animations.slideUp} transition-all duration-500`}>
          <ResearchBriefings
            briefingStatus={researchState.briefingStatus}
            isExpanded={expandedSections.briefings}
            onToggleExpand={() => toggleSection('briefings')}
            isResetting={isResetting}
          />
        </div>
      );
    }

    if (currentPhase === 'enrichment' || currentPhase === 'briefing' || currentPhase === 'complete') {
      components.push(
        <div key="curation" className={`${animations.slideUp} transition-all duration-500`}>
          <CurationExtraction
            enrichmentCounts={researchState.enrichmentCounts}
            isExpanded={expandedSections.curation}
            onToggleExpand={() => toggleSection('curation')}
            isResetting={isResetting}
            loaderColor={loaderColor}
          />
        </div>
      );
    }

    if (researchState.queries.length > 0 || Object.keys(researchState.streamingQueries).length > 0) {
      components.push(
        <div key="queries" className={`${animations.slideUp} transition-all duration-500`}>
          <ResearchQueries
            queries={researchState.queries}
            streamingQueries={researchState.streamingQueries}
            isExpanded={expandedSections.queries}
            onToggleExpand={() => toggleSection('queries')}
            isResetting={isResetting}
            glassStyle={modernTheme.glass.panel}
          />
        </div>
      );
    }

    return components;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`min-h-screen ${modernTheme.background.primary} relative overflow-hidden transition-all duration-500`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Particle System */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500 rounded-full pointer-events-none"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        ))}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-blue-300/20 to-blue-400/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
        
      {/* Floating Control Panel */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3">
        {/* Settings Panel */}
        <div className={`${modernTheme.glass.card} rounded-2xl p-3 transition-all duration-300 ${
          expandedSections.settings ? 'w-64' : 'w-auto'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('settings')}
              className="p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-blue-600" />
            </button>
            
            {expandedSections.settings && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4 text-blue-400" />}
                </button>
              </div>
            )}
          </div>
          
          {expandedSections.settings && (
            <div className="mt-3 space-y-2 border-t border-blue-200/50 pt-3">
              <div className="text-xs text-blue-600/70">Research Progress</div>
              <div className="w-full bg-blue-100/50 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${researchProgress}%` }}
                />
              </div>
              <div className="text-xs text-blue-600/50">{Math.round(researchProgress)}% Complete</div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(isResearching || isComplete) && (
          <button
            onClick={resetResearch}
            className={`${modernTheme.glass.card} rounded-xl p-3 hover:bg-red-500/20 transition-all group`}
          >
            <RefreshCw className="w-5 h-5 text-blue-600 group-hover:text-red-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-40 ${modernTheme.glass.card} rounded-full p-4 hover:bg-blue-100/50 transition-all transform hover:scale-110 ${animations.scaleIn}`}
        >
          <ArrowUp className="w-6 h-6 text-blue-600" />
        </button>
      )}

      {/* Notification Toast Container */}
      {/* <div className="fixed top-6 left-6 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${modernTheme.glass.card} rounded-xl p-4 transition-all duration-300 transform ${animations.slideDown} ${
              notification.type === 'error' ? 'border-red-400/50 bg-red-500/10' :
              notification.type === 'success' ? 'border-green-400/50 bg-green-500/10' :
              notification.type === 'warning' ? 'border-yellow-400/50 bg-yellow-500/10' :
              'border-blue-400/50 bg-blue-500/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                notification.type === 'error' ? 'bg-red-400' :
                notification.type === 'success' ? 'bg-green-400' :
                notification.type === 'warning' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`} />
              <p className="text-gray-700 text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        ))}
      </div> */}
      {/* Close the absolute inset-0 background div */}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className={`${animations.fadeIn} mb-12`}>
          <Header glassStyle={modernTheme.glass.card} />
        </div>

        {/* Research Analytics Panel */}
        {isResearching && (
          <div className={`${modernTheme.glass.panel} rounded-3xl p-6 mb-8 ${animations.slideUp}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Current Phase */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  {currentPhase === 'search' && <Target className="w-8 h-8 text-white" />}
                  {currentPhase === 'enrichment' && <Zap className="w-8 h-8 text-white" />}
                  {currentPhase === 'briefing' && <Brain className="w-8 h-8 text-white" />}
                  {currentPhase === 'complete' && <Sparkles className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-gray-800 font-semibold text-lg capitalize">{currentPhase || 'Initializing'}</h3>
                <p className="text-gray-500 text-sm">Current Phase</p>
              </div>

              {/* Queries Generated */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {researchState.queries.length + Object.keys(researchState.streamingQueries).length}
                </div>
                <h3 className="text-gray-800 font-semibold">Queries</h3>
                <p className="text-gray-500 text-sm">Generated</p>
              </div>

              {/* Documents Processed */}
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {researchState.enrichmentCounts ? 
                    Object.values(researchState.enrichmentCounts).reduce((acc, curr) => acc + curr.enriched, 0) : 0}
                </div>
                <h3 className="text-gray-800 font-semibold">Documents</h3>
                <p className="text-gray-500 text-sm">Processed</p>
              </div>

              {/* Time Elapsed */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {phaseTimestamps.start ? 
                    Math.floor((Date.now() - phaseTimestamps.start) / 1000) : 0}s
                </div>
                <h3 className="text-gray-800 font-semibold">Elapsed</h3>
                <p className="text-gray-500 text-sm">Time</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-800 font-medium">Overall Progress</span>
                <span className="text-gray-600">{Math.round(researchProgress)}%</span>
              </div>
              <div className="w-full bg-blue-100/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${researchProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Form */}
        <div className={`${animations.fadeIn} mb-8`}>
          <ResearchForm 
            onSubmit={handleFormSubmit}
            isResearching={isResearching}
            glassStyle={modernTheme.glass}
            loaderColor={loaderColor}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className={`${modernTheme.glass.card} border-2 border-red-400/50 bg-red-500/10 rounded-2xl p-6 mb-8 ${animations.slideDown} ${
            isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
          } transition-all duration-500`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-400 font-semibold">Research Error</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className={animations.fadeIn}>
          <ResearchStatus
            status={status}
            error={error}
            isComplete={isComplete}
            currentPhase={currentPhase}
            isResetting={isResetting}
            glassStyle={modernTheme.glass}
            loaderColor={loaderColor}
            statusRef={statusRef}
          />
        </div>

        {/* Dynamic Progress Components */}
        <div className="space-y-8 mt-8">
          {renderProgressComponents()}
        </div>

        {/* Research Summary Card */}
        {isComplete && phaseTimestamps.start && (
          <div className={`${modernTheme.glass.panel} rounded-3xl p-8 mt-8 ${animations.fadeIn}`}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Research Complete! 🎉</h2>
              <p className="text-gray-600 text-lg mb-6">
                Successfully analyzed <span className="text-emerald-400 font-semibold">{originalCompanyName}</span>
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor((Date.now() - phaseTimestamps.start) / 1000)}s
                  </div>
                  <div className="text-gray-500 text-sm">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {researchState.queries.length}
                  </div>
                  <div className="text-gray-500 text-sm">Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {Object.values(researchState.briefingStatus).filter(Boolean).length}
                  </div>
                  <div className="text-gray-500 text-sm">Briefings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {researchState.enrichmentCounts ? 
                      Object.values(researchState.enrichmentCounts).reduce((acc, curr) => acc + curr.enriched, 0) : 0}
                  </div>
                  <div className="text-gray-500 text-sm">Documents</div>
                </div>
              </div>
              
              <button
                onClick={resetResearch}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Start New Research
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Phase Indicator */}
      {isResearching && currentPhase && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className={`${modernTheme.glass.card} rounded-2xl p-4 ${animations.slideUp}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentPhase === 'search' ? 'bg-blue-500/20' :
                currentPhase === 'enrichment' ? 'bg-emerald-500/20' :
                currentPhase === 'briefing' ? 'bg-purple-500/20' :
                'bg-pink-500/20'
              }`}>
                {currentPhase === 'search' && <Target className="w-4 h-4 text-blue-400" />}
                {currentPhase === 'enrichment' && <Zap className="w-4 h-4 text-emerald-400" />}
                {currentPhase === 'briefing' && <Brain className="w-4 h-4 text-purple-400" />}
                {currentPhase === 'complete' && <Sparkles className="w-4 h-4 text-pink-400" />}
              </div>
              <div>
                <div className="text-gray-800 font-medium text-sm capitalize">{currentPhase} Phase</div>
                <div className="text-gray-500 text-xs">
                  {currentPhase === 'search' && 'Generating research queries'}
                  {currentPhase === 'enrichment' && 'Processing documents'}
                  {currentPhase === 'briefing' && 'Creating briefings'}
                  {currentPhase === 'complete' && 'Analysis complete'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;