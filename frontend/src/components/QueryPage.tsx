import React, { useState } from "react";
import {
  ArrowLeft,
  Send,
  FileText,
  Loader2,
  MessageSquare,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface QueryPageProps {
  uploadedFileName: string;
  onBackToUpload: () => void;
}

const QueryPage: React.FC<QueryPageProps> = ({
  uploadedFileName,
  onBackToUpload,
}) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const response = await fetch(
        "https://resumereview-x9ve.onrender.com/v1/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: query.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const responseText = await response.text();

      // Try to parse as JSON first
      try {
        const jsonResponse = JSON.parse(responseText);
        // If it's a JSON object with a "response" key, extract the content
        if (
          jsonResponse &&
          typeof jsonResponse === "object" &&
          jsonResponse.response
        ) {
          setResponse(jsonResponse.response);
        } else {
          // If it's just a JSON string, use it directly
          setResponse(responseText);
        }
      } catch (jsonError) {
        // If it's not valid JSON, treat it as plain text
        setResponse(responseText);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Query failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuery = () => {
    setQuery("");
    setResponse("");
    setError("");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackToUpload}
            className="
              inline-flex items-center text-gray-600 hover:text-gray-900 
              transition-colors duration-200 mb-6
            "
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Upload Different Resume
          </button>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Resume Uploaded
                </h2>
                <p className="text-gray-600">{uploadedFileName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
                Job Description Query
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="query"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    Paste the job description or ask specific questions about
                    your resume:
                  </label>
                  <textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: 'How well does my resume match this software engineer position?' or paste the complete job description here..."
                    className="
                      w-full h-40 px-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      resize-none transition-all duration-200
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="
                    w-full inline-flex items-center justify-center px-6 py-3 
                    bg-blue-600 text-white rounded-lg font-semibold
                    hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                    shadow-lg hover:shadow-xl
                  "
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Sample Queries */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Try asking:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• "What skills am I missing for this role?"</li>
                <li>• "How can I improve my resume for this position?"</li>
                <li>• "What are my strongest qualifications?"</li>
                <li>• "Does my experience align with the requirements?"</li>
              </ul>
            </div>
          </div>

          {/* Response */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border min-h-[500px]">
              {response ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Analysis Results
                    </h3>
                    <button
                      onClick={handleNewQuery}
                      className="
                        px-4 py-2 text-blue-600 border border-blue-600 rounded-lg
                        hover:bg-blue-50 transition-colors duration-200
                      "
                    >
                      New Query
                    </button>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <MarkdownRenderer text={response} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">
                      Submit your query to see the analysis results
                    </p>
                    <p className="text-sm mt-2">
                      The AI will provide detailed feedback about your resume
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryPage;
