import React from 'react';
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { 
  Check, 
  Copy, 
  Download, 
  Loader2, 
  FileText, 
  Share2, 
  ExternalLink, 
  Star,
  Sparkles,
  Award
} from 'lucide-react';
import { GlassStyle, AnimationStyle } from '../types';

interface ResearchReportProps {
  output: {
    summary: string;
    details: {
      report: string;
    };
  } | null;
  isResetting: boolean;
  glassStyle: GlassStyle;
  fadeInAnimation: AnimationStyle;
  loaderColor: string;
  isGeneratingPdf: boolean;
  isCopied: boolean;
  onCopyToClipboard: () => void;
  onGeneratePdf: () => void;
}

const ResearchReport: React.FC<ResearchReportProps> = ({
  output,
  isResetting,
  loaderColor,
  isGeneratingPdf,
  isCopied,
  onCopyToClipboard,
  onGeneratePdf
}) => {
  if (!output || !output.details) return null;

  return (
    <div 
      className={`relative transition-all duration-500 ${
        isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
      
      {/* Main Container */}
      <div className="relative bg-white/90 backdrop-blur-2xl border-2 border-blue-200/50 rounded-3xl p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-3xl font-bold text-gray-800">Research Report</h2>
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-gray-600 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Comprehensive analysis complete</span>
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCopyToClipboard}
              className="group relative overflow-hidden bg-blue-50/50 hover:bg-emerald-50 border-2 border-blue-200 hover:border-emerald-400/50 rounded-xl p-3 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              <div className="relative flex items-center space-x-2">
                {isCopied ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-gray-600 group-hover:text-emerald-600 font-medium transition-colors">Copy</span>
                  </>
                )}
              </div>
            </button>

            <button
              onClick={onGeneratePdf}
              disabled={isGeneratingPdf}
              className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl p-3 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              <div className="relative flex items-center space-x-2">
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" style={{ stroke: loaderColor }} />
                    <span className="font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span className="font-semibold">Export PDF</span>
                  </>
                )}
              </div>
            </button>

            <button className="group relative overflow-hidden bg-blue-50/50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400/70 rounded-xl p-3 transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              <div className="relative">
                <Share2 className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white/60 backdrop-blur-sm border-2 border-blue-100/70 rounded-2xl p-8">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                div: ({node, ...props}) => (
                  <div className="space-y-4 text-gray-700" {...props} />
                ),
                h1: ({node, children, ...props}) => {
                  const text = String(children);
                  const isFirstH1 = text.includes("Research Report");
                  const isReferences = text.includes("References");
                  return (
                    <div>
                      <h1 
                        className={`font-bold text-gray-800 break-words whitespace-pre-wrap ${
                          isFirstH1 
                            ? 'text-4xl mb-8 mt-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent' 
                            : 'text-3xl mb-6'
                        }`} 
                        {...props} 
                      >
                        {children}
                      </h1>
                      {isReferences && (
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>
                      )}
                    </div>
                  );
                },
                h2: ({node, ...props}) => (
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent first:mt-2 mt-8 mb-4" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3" {...props} />
                ),
                p: ({node, children, ...props}) => {
                  const text = String(children);
                  const isSubsectionHeader = (
                    text.includes('\n') === false && 
                    text.length < 50 && 
                    (text.endsWith(':') || /^[A-Z][A-Za-z\s\/]+$/.test(text))
                  );
                  
                  if (isSubsectionHeader) {
                    return (
                      <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
                        {text.endsWith(':') ? text.slice(0, -1) : text}
                      </h3>
                    );
                  }
                  
                  const isBulletLabel = text.startsWith('•') && text.includes(':');
                  if (isBulletLabel) {
                    const [label, content] = text.split(':');
                    return (
                      <div className="text-gray-600 my-3 bg-blue-50/50 rounded-lg p-4 border border-blue-200/50">
                        <span className="font-semibold text-emerald-600">
                          {label.replace('•', '').trim()}:
                        </span>
                        <span className="ml-2">{content}</span>
                      </div>
                    );
                  }
                  
                  const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
                  if (urlRegex.test(text)) {
                    const parts = text.split(urlRegex);
                    return (
                      <p className="text-gray-600 my-2 leading-relaxed" {...props}>
                        {parts.map((part, i) => 
                          urlRegex.test(part) ? (
                            <a 
                              key={i}
                              href={part}
                              className="text-cyan-600 hover:text-cyan-700 underline decoration-cyan-600/50 hover:decoration-cyan-700 cursor-pointer transition-all duration-200 inline-flex items-center space-x-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>{part}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : part
                        )}
                      </p>
                    );
                  }
                  
                  return <p className="text-gray-600 my-2 leading-relaxed" {...props}>{children}</p>;
                },
                ul: ({node, ...props}) => (
                  <ul className="text-gray-600 space-y-2 list-none pl-0" {...props} />
                ),
                li: ({node, children, ...props}) => (
                  <li className="text-gray-600 flex items-start space-x-3" {...props}>
                    <Star className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                a: ({node, href, ...props}) => (
                  <a 
                    href={href}
                    className="text-cyan-600 hover:text-cyan-700 underline decoration-cyan-600/50 hover:decoration-cyan-700 cursor-pointer transition-all duration-200 inline-flex items-center space-x-1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props} 
                  >
                    <span>{props.children}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-emerald-400 bg-blue-50/30 pl-4 py-3 my-4 italic text-gray-600 rounded-r-lg" {...props} />
                ),
                code: ({node, className, children, ...props}) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-blue-100/50 text-emerald-600 px-2 py-1 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-50 border border-gray-200 text-gray-700 p-4 rounded-xl text-sm overflow-x-auto" {...props}>
                      {children}
                    </code>
                  );
                },
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full bg-white/60 border border-blue-200 rounded-xl overflow-hidden" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => (
                  <th className="bg-blue-100/50 text-gray-700 font-semibold p-3 text-left border-b border-blue-200" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="text-gray-600 p-3 border-b border-blue-100/50" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="text-gray-800 font-semibold" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="text-gray-700 italic" {...props} />
                ),
              }}
            >
              {output.details.report || "No report available"}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-blue-200/50 flex items-center justify-between">          
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
              <span className="text-emerald-700 text-sm font-medium">✅ Complete</span>
            </div>
            <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
              <span className="text-blue-700 text-sm font-medium">📊 Analysis Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchReport;