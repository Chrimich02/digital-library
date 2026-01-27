import React from 'react';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Settings,
  BookOpen
} from 'lucide-react';

const ReaderToolbar = ({
  book,
  currentPage,
  numPages,
  scale,
  onScaleChange,
  onPageChange,
  onBack,
  onToggleSidebar,
  onToggleSettings
}) => {
  return (
    <div className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
              title="Επιστροφή"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Πίσω</span>
            </button>

            <div className="h-8 w-px bg-slate-700"></div>

            <button
              onClick={onToggleSidebar}
              className="p-2.5 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 transform hover:scale-105"
              title="Σημειώσεις"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Center Section - Book Info */}
          <div className="hidden md:flex flex-col items-center animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h1 className="text-white font-bold text-base truncate max-w-md">
                {book.title}
              </h1>
            </div>
            {book.author && (
              <p className="text-gray-400 text-sm">{book.author}</p>
            )}
          </div>

          {/* Right Section - Settings Only */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSettings}
              className="p-2.5 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 transform hover:scale-105"
              title="Ρυθμίσεις"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar - Page Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Previous Page */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2.5 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Info */}
          <div className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-xl">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages) {
                  onPageChange(page);
                }
              }}
              className="w-16 px-2 py-1.5 bg-slate-700 text-white text-center rounded-lg border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              min="1"
              max={numPages}
            />
            <span className="text-gray-400 text-sm font-medium">/ {numPages}</span>
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="p-2.5 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="h-8 w-px bg-slate-700 mx-2"></div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-xl">
            <button
              onClick={() => onScaleChange(Math.max(0.5, scale - 0.1))}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-300 transform hover:scale-110"
              title="Σμίκρυνση"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-gray-300 text-sm font-bold min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={() => onScaleChange(Math.min(3, scale + 0.1))}
              className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-300 transform hover:scale-110"
              title="Μεγέθυνση"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReaderToolbar;