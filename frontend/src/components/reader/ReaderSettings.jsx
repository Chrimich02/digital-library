import React from 'react';
import { X, Sun, Moon, FileText, Settings } from 'lucide-react';

const ReaderSettings = ({ settings, onSettingsChange, onClose }) => {
  const themes = [
    { id: 'light', name: 'Φωτεινό', icon: Sun, bg: 'bg-white', text: 'text-gray-900', gradient: 'from-blue-50 to-purple-50' },
    { id: 'dark', name: 'Σκούρο', icon: Moon, bg: 'bg-slate-900', text: 'text-white', gradient: 'from-slate-900 to-blue-900' },
    { id: 'sepia', name: 'Sepia', icon: FileText, bg: 'bg-amber-50', text: 'text-amber-900', gradient: 'from-amber-50 to-orange-50' }
  ];

  const handleThemeChange = (theme) => {
    onSettingsChange({ ...settings, theme });
  };

  const handleBrightnessChange = (brightness) => {
    onSettingsChange({ ...settings, brightness: parseInt(brightness) });
  };

  const handleFontSizeChange = (fontSize) => {
    onSettingsChange({ ...settings, fontSize: parseInt(fontSize) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white text-xl font-bold">Ρυθμίσεις Ανάγνωσης</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div>
            <label className="block text-white text-sm font-bold mb-4 uppercase tracking-wider">
              Θέμα Χρωμάτων
            </label>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    settings.theme === theme.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg scale-105'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${theme.gradient} transition-transform duration-300 ${
                      settings.theme === theme.id ? 'scale-110' : ''
                    }`}
                  >
                    <theme.icon className={`w-7 h-7 ${theme.text}`} />
                  </div>
                  <span className={`text-sm font-bold ${
                    settings.theme === theme.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brightness */}
          <div>
            <label className="block text-white text-sm font-bold mb-4 uppercase tracking-wider">
              Φωτεινότητα
              <span className="ml-3 text-blue-400 font-normal bg-blue-500/20 px-3 py-1 rounded-full text-xs">
                {settings.brightness}%
              </span>
            </label>
            <div className="flex items-center gap-4">
              <Sun className="w-5 h-5 text-gray-400" />
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.brightness}
                  onChange={(e) => handleBrightnessChange(e.target.value)}
                  className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${
                      ((settings.brightness - 50) / 100) * 100
                    }%, #334155 ${((settings.brightness - 50) / 100) * 100}%, #334155 100%)`
                  }}
                />
              </div>
              <Sun className="w-7 h-7 text-gray-400" />
            </div>
          </div>

          {/* Zoom */}
          <div>
            <label className="block text-white text-sm font-bold mb-4 uppercase tracking-wider">
              Ζουμ Σελίδας
              <span className="ml-3 text-purple-400 font-normal bg-purple-500/20 px-3 py-1 rounded-full text-xs">
                {settings.fontSize}%
              </span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm font-bold">A</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={settings.fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${
                      ((settings.fontSize - 50) / 150) * 100
                    }%, #334155 ${((settings.fontSize - 50) / 150) * 100}%, #334155 100%)`
                  }}
                />
              </div>
              <span className="text-gray-400 text-2xl font-bold">A</span>
            </div>
            <p className="text-gray-400 text-xs mt-3 ml-1">
              Ελέγχει το μέγεθος της σελίδας PDF
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 flex justify-end gap-3">
          <button
            onClick={() => {
              onSettingsChange({
                theme: 'dark',
                brightness: 100,
                fontSize: 100
              });
            }}
            className="px-6 py-3 text-gray-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-300 font-bold transform hover:scale-105"
          >
            Επαναφορά
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Εντάξει
          </button>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.8);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default ReaderSettings;