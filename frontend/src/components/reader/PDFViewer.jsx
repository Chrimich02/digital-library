import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({
  pdfUrl,
  currentPage,
  scale,
  onPageChange,
  onDocumentLoad,
  annotations,
  highlightMode,
  highlightColor,
  onCreateHighlight,
  theme,
  brightness
}) => {
  const [loading, setLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const containerRef = useRef(null);
  const pageRef = useRef(null);
  const textLayerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setLoading(false);
    onDocumentLoad(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
  };

  // Capture page dimensions when page loads
  const onPageLoadSuccess = (page) => {
    const { width, height } = page;
    setPageWidth(width * scale);
    setPageHeight(height * scale);
  };

  // Handle text selection for highlighting
  const handleMouseUp = () => {
    if (!highlightMode || isSelecting) return;

    setIsSelecting(true);
    
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        // Get all ranges from selection
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        
        if (rects.length > 0) {
          // Get the text layer element
          const textLayer = textLayerRef.current || 
                           pageRef.current?.querySelector('.react-pdf__Page__textContent');
          
          if (!textLayer) {
            console.warn('Text layer not found');
            setIsSelecting(false);
            return;
          }

          const textLayerRect = textLayer.getBoundingClientRect();
          
          // Convert all rectangles to relative coordinates
          const positions = Array.from(rects).map(rect => ({
            x: (rect.left - textLayerRect.left) / scale,
            y: (rect.top - textLayerRect.top) / scale,
            width: rect.width / scale,
            height: rect.height / scale
          }));

          // Create highlight with multiple positions (for multi-line selections)
          onCreateHighlight({
            text: selectedText,
            positions: positions,
            pageNumber: currentPage
          });

          // Clear selection
          selection.removeAllRanges();
        }
      }
      
      setIsSelecting(false);
    }, 10);
  };

  // Update text layer ref when page changes
  useEffect(() => {
    const updateTextLayerRef = () => {
      const textLayer = pageRef.current?.querySelector('.react-pdf__Page__textContent');
      if (textLayer) {
        textLayerRef.current = textLayer;
      }
    };

    // Wait for text layer to render
    const timer = setTimeout(updateTextLayerRef, 100);
    return () => clearTimeout(timer);
  }, [currentPage, scale]);

  // Get background color based on theme
  const getBackgroundColor = () => {
    if (theme === 'dark') return '#0f172a';
    if (theme === 'sepia') return '#fef3c7';
    return '#f8fafc';
  };

  // Get current page annotations
  const currentPageAnnotations = annotations.filter(
    a => a.pageNumber === currentPage && a.type === 'highlight'
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto p-8 transition-all duration-300"
      style={{
        backgroundColor: getBackgroundColor(),
        filter: `brightness(${brightness}%)`
      }}
    >
      <div className="inline-block min-w-full">
        <div className="relative w-fit mx-auto">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10 rounded-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-3"></div>
                <p className="text-gray-300 font-medium">Φόρτωση PDF...</p>
              </div>
            </div>
          )}

          <div 
            ref={pageRef} 
            className="relative shadow-2xl rounded-xl overflow-hidden transition-transform duration-300 hover:shadow-3xl" 
            onMouseUp={handleMouseUp}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-12 bg-slate-800/50 backdrop-blur-sm rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Φόρτωση...</p>
                  </div>
                </div>
              }
            >
              <Page
                key={`page-${currentPage}-${scale}`}
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                onLoadSuccess={onPageLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </div>
                }
              />
            </Document>

            {/* SVG Overlay for Highlights */}
            {pageWidth > 0 && pageHeight > 0 && currentPageAnnotations.length > 0 && (
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: `${pageWidth}px`,
                  height: `${pageHeight}px`,
                  zIndex: 1
                }}
              >
                {currentPageAnnotations.map((annotation) => {
                  // Handle both single position (old format) and multiple positions (new format)
                  const positions = annotation.positions || 
                    (annotation.position ? [annotation.position] : []);

                  return positions.map((pos, index) => (
                    <rect
                      key={`${annotation.id}-${index}`}
                      x={pos.x * scale}
                      y={pos.y * scale}
                      width={pos.width * scale}
                      height={pos.height * scale}
                      fill={annotation.color || '#ffeb3b'}
                      opacity="0.4"
                      className="transition-opacity duration-200 hover:opacity-60"
                      style={{
                        mixBlendMode: 'multiply',
                        pointerEvents: 'auto',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        console.log('Clicked highlight:', annotation);
                      }}
                    />
                  ));
                })}
              </svg>
            )}
          </div>

          {/* Highlight Mode Indicator - Positioned below toolbar, fully visible */}
          {highlightMode && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-sm border-2 border-white/50 animate-pulse">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-md"
                  style={{ backgroundColor: highlightColor }}
                />
                <span className="text-xs font-bold">
                   Επιλέξτε κείμενο για επισήμανση
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;