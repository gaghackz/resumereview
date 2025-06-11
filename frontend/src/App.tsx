import React, { useState } from 'react';
import UploadPage from './components/UploadPage';
import QueryPage from './components/QueryPage';

export type AppState = 'upload' | 'query';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleUploadSuccess = (fileName: string) => {
    setUploadedFileName(fileName);
    setCurrentPage('query');
  };

  const handleBackToUpload = () => {
    setCurrentPage('upload');
    setUploadedFileName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentPage === 'upload' ? (
        <UploadPage onUploadSuccess={handleUploadSuccess} />
      ) : (
        <QueryPage 
          uploadedFileName={uploadedFileName}
          onBackToUpload={handleBackToUpload}
        />
      )}
    </div>
  );
}

export default App;