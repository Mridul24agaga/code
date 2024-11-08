'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, X, Check, Code, Eye } from 'lucide-react';

interface CodeSidebarProps {
  code: string;
  language?: string;
  onClose: () => void;
}

const CodeSidebar: React.FC<CodeSidebarProps> = ({ code, language = 'plaintext', onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [code]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (activeTab === 'preview' && iframeRef.current) {
      const previewContent = generatePreviewContent(language, code);
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [activeTab, code, language]);

  const handleTabChange = useCallback((tab: 'code' | 'preview') => {
    setActiveTab(tab);
  }, []);

  const generatePreviewContent = (lang: string, content: string): string => {
    switch (lang.toLowerCase()) {
      case 'html':
        return content.includes('<html') ? content : `<html><body>${content}</body></html>`;
      case 'css':
        return `<html><head><style>${content}</style></head><body><div id="preview">CSS Preview</div></body></html>`;
      case 'javascript':
      case 'jsx':
      case 'tsx':
        return `
          <html>
            <head>
              <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                ${content}
                ReactDOM.render(<App />, document.getElementById('root'));
              </script>
            </body>
          </html>
        `;
      default:
        return `<html><body><pre>${content}</pre></body></html>`;
    }
  };

  return (
    <div className="h-full w-full bg-[#1E1E1E] border-l border-zinc-800 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b border-zinc-800">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100">Generated Code</h2>
        <button 
          className="p-1 sm:p-2 text-zinc-400 hover:text-zinc-100"
          onClick={onClose}
          aria-label="Close code sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex border-b border-zinc-800">
          <button
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'code' 
                ? 'bg-[#1E1E1E] text-white border-b-2 border-purple-500' 
                : 'bg-[#252526] text-zinc-400 hover:text-zinc-100'
            }`}
            onClick={() => handleTabChange('code')}
          >
            <Code className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Code
          </button>
          <button
            className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'preview' 
                ? 'bg-[#1E1E1E] text-white border-b-2 border-purple-500' 
                : 'bg-[#252526] text-zinc-400 hover:text-zinc-100'
            }`}
            onClick={() => handleTabChange('preview')}
          >
            <Eye className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Preview
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {activeTab === 'code' ? (
            <div className="p-2 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-zinc-400">Generated Code ({language})</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-800"
                  aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-lg bg-[#1E1E1E] text-white overflow-hidden">
                <pre className="p-2 sm:p-4 overflow-x-auto">
                  <code className="text-xs sm:text-sm font-mono">{code}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-none"
                title="Code Preview"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeSidebar;