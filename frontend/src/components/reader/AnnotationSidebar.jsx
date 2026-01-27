import React, { useState } from 'react';
import { 
  Highlighter, 
  BookmarkIcon, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  X,
  Save,
  ChevronDown,
  ChevronUp,
  BookmarkPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { el } from 'date-fns/locale';

const AnnotationSidebar = ({
  annotations,
  currentPage,
  activeTab,
  onTabChange,
  onAnnotationClick,
  onDeleteAnnotation,
  onUpdateAnnotation,
  onCreateNote,
  highlightMode,
  onToggleHighlightMode,
  highlightColor,
  onHighlightColorChange,
  onCreateBookmark
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [deletingAnnotation, setDeletingAnnotation] = useState(null);

  const colors = [
    { name: 'Κίτρινο', value: '#ffeb3b' },
    { name: 'Πράσινο', value: '#4caf50' },
    { name: 'Ροζ', value: '#ff4081' },
    { name: 'Μπλε', value: '#2196f3' },
    { name: 'Πορτοκαλί', value: '#ff9800' }
  ];

  // Group annotations by page
  const groupedAnnotations = annotations.reduce((acc, annotation) => {
    const page = annotation.pageNumber || 0;
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(annotation);
    return acc;
  }, {});

  const tabs = [
    { id: 'all', name: 'Όλα', icon: MessageSquare },
    { id: 'highlight', name: 'Επισημάνσεις', icon: Highlighter },
    { id: 'note', name: 'Σημειώσεις', icon: MessageSquare },
    { id: 'bookmark', name: 'Σελιδοδείκτες', icon: BookmarkIcon }
  ];

  const filteredAnnotations = activeTab === 'all'
    ? annotations
    : annotations.filter(a => a.type === activeTab);

  const handleStartEdit = (annotation) => {
    setEditingId(annotation.id);
    setEditContent(annotation.content || '');
  };

  const handleSaveEdit = async (annotationId) => {
    await onUpdateAnnotation(annotationId, { content: editContent });
    setEditingId(null);
    setEditContent('');
  };

  const handleCreateNote = async () => {
    if (newNote.trim()) {
      await onCreateNote(newNote);
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  const handleDeleteAnnotation = async () => {
    if (deletingAnnotation) {
      await onDeleteAnnotation(deletingAnnotation.id);
      setDeletingAnnotation(null);
    }
  };

  const toggleGroup = (page) => {
    setExpandedGroups(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const getAnnotationIcon = (type) => {
    switch (type) {
      case 'highlight':
        return <Highlighter className="w-4 h-4" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'bookmark':
        return <BookmarkIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDeleteMessage = (annotation) => {
    if (!annotation) return { article: 'την', type: 'σημείωση', titleType: 'σημείωσης' };
    
    switch (annotation.type) {
      case 'highlight':
        return { article: 'την', type: 'επισήμανση', titleType: 'επισήμανσης' };
      case 'note':
        return { article: 'τη', type: 'σημείωση', titleType: 'σημείωσης' };
      case 'bookmark':
        return { article: 'τον', type: 'σελιδοδείκτη', titleType: 'σελιδοδείκτη' };
      default:
        return { article: 'την', type: 'σημείωση', titleType: 'σημείωσης' };
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'highlight':
        return {
          icon: <Highlighter className="w-12 h-12 text-gray-600 mb-4" />,
          text: 'Δεν υπάρχουν επισημάνσεις ακόμα',
          subtitle: 'Ενεργοποιήστε τη λειτουργία επισήμανσης και επιλέξτε κείμενο'
        };
      case 'note':
        return {
          icon: <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />,
          text: 'Δεν υπάρχουν σημειώσεις ακόμα',
          subtitle: 'Πατήστε "Νέα Σημείωση" για να προσθέσετε'
        };
      case 'bookmark':
        return {
          icon: <BookmarkIcon className="w-12 h-12 text-gray-600 mb-4" />,
          text: 'Δεν υπάρχουν σελιδοδείκτες ακόμα',
          subtitle: 'Χρησιμοποιήστε το κουμπί σελιδοδείκτη για να προσθέσετε'
        };
      default:
        return {
          icon: <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />,
          text: 'Δεν υπάρχουν σημειώσεις ακόμα',
          subtitle: 'Ξεκινήστε να σημειώνετε το βιβλίο σας!'
        };
    }
  };

  const emptyState = getEmptyMessage();
  const deleteInfo = getDeleteMessage(deletingAnnotation);

  return (
    <>
      {/* SIDEBAR */}
      <div className="w-96 bg-slate-800/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col h-full shadow-2xl">
        {/* Header - COMPACT */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <h2 className="text-white font-bold text-lg mb-3">Σημειώσεις</h2>

          {/* ACTION BUTTONS - Επισήμανση, Σημειώσεις, Σελιδοδείκτης - COMPACT */}
          <div className="mb-3 space-y-2">
            {/* Highlight Button with Color Picker - COMPACT */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-2">
              <button
                onClick={onToggleHighlightMode}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-xs ${
                  highlightMode
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 shadow-lg shadow-yellow-500/30'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Highlighter className="w-4 h-4" />
                <span>Επισήμανση</span>
                {highlightMode && (
                  <span className="ml-auto bg-slate-900/30 px-1.5 py-0.5 rounded text-[10px]">
                    ON
                  </span>
                )}
              </button>

              {/* Color Picker - Visible only when highlight mode is active - COMPACT */}
              {highlightMode && (
                <div className="flex gap-1.5 px-1 mt-2 animate-slide-down">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onHighlightColorChange(color.value)}
                      className={`flex-1 h-7 rounded-md border-2 transition-all duration-300 transform hover:scale-110 ${
                        highlightColor === color.value
                          ? 'border-white scale-110 shadow-md ring-1 ring-white/50'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Note and Bookmark Buttons - COMPACT - Side by Side */}
            <div className="flex gap-2">
              {/* Note Button - COMPACT */}
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-xs shadow-md transform hover:scale-105 ${
                  showNoteForm
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Σημείωση</span>
              </button>

              {/* Bookmark Button - COMPACT */}
              <button
                onClick={onCreateBookmark}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-xs shadow-md transform hover:scale-105"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Σελιδοδείκτης</span>
              </button>
            </div>
          </div>
          
          {/* Tabs for Filtering - COMPACT */}
          <div className="flex gap-1 bg-slate-900/50 backdrop-blur-sm rounded-lg p-1 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 rounded-md transition-all duration-300 font-medium min-w-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title={tab.name}
              >
                <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[9px] leading-tight text-center truncate w-full">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Note Form - COMPACT */}
        {showNoteForm && (
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-b border-slate-700/50 animate-slide-down">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Γράψτε τη σημείωσή σας..."
              className="w-full px-3 py-2 bg-slate-800 text-white text-sm rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none resize-none transition-colors duration-300"
              rows="3"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreateNote}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-xs font-bold shadow-md transform hover:scale-105"
              >
                <Save className="w-3.5 h-3.5 inline mr-1.5" />
                Αποθήκευση
              </button>
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setNewNote('');
                }}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-300 text-xs font-bold transform hover:scale-105"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Annotations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredAnnotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-2xl">
                {emptyState.icon}
                <p className="text-gray-300 text-base font-bold mb-2">
                  {emptyState.text}
                </p>
                <p className="text-gray-500 text-sm">
                  {emptyState.subtitle}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {Object.entries(groupedAnnotations)
                .filter(([page, annotations]) => 
                  activeTab === 'all' || annotations.some(a => a.type === activeTab)
                )
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([page, pageAnnotations]) => {
                  const filtered = activeTab === 'all' 
                    ? pageAnnotations 
                    : pageAnnotations.filter(a => a.type === activeTab);
                  
                  if (filtered.length === 0) return null;

                  const isExpanded = expandedGroups[page] !== false;

                  return (
                    <div key={page} className="bg-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50 animate-fade-in">
                      {/* Page Header */}
                      <button
                        onClick={() => toggleGroup(page)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-300"
                      >
                        <span className="text-white text-sm font-bold flex items-center gap-2">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs">
                            Σελίδα {page}
                          </span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg text-xs font-bold">
                            {filtered.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Annotations in this page */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-700/50">
                          {filtered.map((annotation) => (
                            <div
                              key={annotation.id}
                              className={`p-4 cursor-pointer hover:bg-slate-800/80 transition-all duration-300 ${
                                currentPage === annotation.pageNumber ? 'bg-slate-800/80 border-l-4 border-blue-500' : ''
                              }`}
                              onClick={() => onAnnotationClick(annotation)}
                            >
                              {/* Annotation Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="p-2 rounded-lg shadow-lg"
                                    style={{
                                      backgroundColor: annotation.type === 'highlight'
                                        ? (annotation.color || '#ffeb3b')
                                        : annotation.type === 'bookmark'
                                        ? '#10b981'
                                        : '#3b82f6'
                                    }}
                                  >
                                    {getAnnotationIcon(annotation.type)}
                                  </div>
                                  <span className="text-xs text-gray-400 font-medium">
                                    {formatDistanceToNow(new Date(annotation.createdAt), {
                                      addSuffix: true,
                                      locale: el
                                    })}
                                  </span>
                                </div>

                                <div className="flex gap-1">
                                  {(annotation.type === 'note' || annotation.content) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEdit(annotation);
                                      }}
                                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingAnnotation(annotation);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Highlighted Text */}
                              {annotation.highlightedText && (
                                <p
                                  className="text-sm mb-3 p-3 rounded-lg font-medium border-l-4"
                                  style={{ 
                                    backgroundColor: `${annotation.color}20`,
                                    borderColor: annotation.color
                                  }}
                                >
                                  "{annotation.highlightedText}"
                                </p>
                              )}

                              {/* Annotation Content */}
                              {editingId === annotation.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                                    rows="3"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveEdit(annotation.id);
                                      }}
                                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold"
                                    >
                                      Αποθήκευση
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(null);
                                      }}
                                      className="px-3 py-2 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600 font-bold"
                                    >
                                      Ακύρωση
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                annotation.content && (
                                  <p className="text-sm text-gray-300 leading-relaxed">{annotation.content}</p>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Custom Styles */}
        <style>{`
          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5);
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.5);
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.7);
          }
        `}</style>
      </div>

      {/* Delete Annotation Confirmation Modal - OUTSIDE SIDEBAR FOR PROPER POSITIONING */}
      {deletingAnnotation && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setDeletingAnnotation(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Διαγραφή {deleteInfo.titleType}
                </h3>
                <p className="text-sm text-gray-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2 text-lg">
              Είστε σίγουροι ότι θέλετε να διαγράψετε {deleteInfo.article} {deleteInfo.type};
            </p>
            
            {deletingAnnotation.highlightedText && (
              <div className="mb-6 mt-4 p-3 bg-gray-50 rounded-lg text-sm italic border-l-4 border-gray-300">
                "{deletingAnnotation.highlightedText.substring(0, 100)}{deletingAnnotation.highlightedText.length > 100 ? '...' : ''}"
              </div>
            )}

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setDeletingAnnotation(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleDeleteAnnotation}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Animation Style */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AnnotationSidebar;