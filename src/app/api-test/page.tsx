"use client";

import React, { useState } from "react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Download,
  Code,
  Loader2,
  FileJson,
  Settings,
} from "lucide-react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ParamType = "query" | "header" | "body";

interface Parameter {
  id: string;
  type: ParamType;
  key: string;
  value: string;
  enabled: boolean;
}

interface ApiResponse {
  data: unknown;
  headers: Record<string, string>;
  status: number;
  statusText: string;
  url: string;
}

type ViewMode = "pretty" | "raw" | "headers";

const ApiPlayground = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<Method>("GET");
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [activeTab, setActiveTab] = useState<ParamType>("query");
  const [viewMode, setViewMode] = useState<ViewMode>("pretty");

  const addParameter = (type: ParamType) => {
    const newParam: Parameter = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      key: "",
      value: "",
      enabled: true,
    };
    setParameters([...parameters, newParam]);
  };

  const removeParameter = (id: string) => {
    setParameters(parameters.filter((param) => param.id !== id));
  };

  const updateParameter = (
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    setParameters(
      parameters.map((param) =>
        param.id === id ? { ...param, [field]: value } : param
      )
    );
  };

  const buildUrl = (baseUrl: string, queryParams: Parameter[]) => {
    const url = new URL(
      baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`
    );
    queryParams.forEach((param) => {
      if (param.enabled && param.key) {
        url.searchParams.append(param.key, param.value);
      }
    });
    return url.toString();
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setResponseTime(null);

    try {
      const queryParams = parameters.filter((p) => p.type === "query");
      const headers = parameters.filter((p) => p.type === "header");
      const bodyParams = parameters.filter((p) => p.type === "body");

      const finalUrl = buildUrl(url, queryParams);
      const startTime = performance.now();

      const requestHeaders = new Headers();
      headers.forEach((header) => {
        if (header.enabled && header.key) {
          requestHeaders.append(header.key, header.value);
        }
      });

      let bodyContent: Record<string, string> = {};
      bodyParams.forEach((param) => {
        if (param.enabled && param.key) {
          bodyContent[param.key] = param.value;
        }
      });

      const response = await fetch(finalUrl, {
        method,
        headers: requestHeaders,
        body: method !== "GET" ? JSON.stringify(bodyContent) : undefined,
      });

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const data = await response.json();
      setResponse({
        data,
        headers: responseHeaders,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      setEditedJson(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
  };

  const handleDownloadResponse = () => {
    const blob = new Blob([JSON.stringify(response, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "response.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-mono flex items-center gap-2">
          <Code className="w-8 h-8" />
          API Playground
        </h1>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="px-3 py-2 border rounded-md font-mono text-sm bg-white"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter API URL"
          className="flex-grow px-4 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSendRequest}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>

      <div className="flex-grow grid grid-cols-2 gap-4">
        {/* Left panel - Parameters */}
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <div className="border-b bg-white p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("query")}
                className={`px-3 py-1 rounded-md ${
                  activeTab === "query"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Query Params
              </button>
              <button
                onClick={() => setActiveTab("header")}
                className={`px-3 py-1 rounded-md ${
                  activeTab === "header"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab("body")}
                className={`px-3 py-1 rounded-md ${
                  activeTab === "body"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Body
              </button>
            </div>
          </div>
          <div
            className="p-4 overflow-y-auto"
            style={{ height: "calc(100% - 49px)" }}
          >
            {parameters
              .filter((param) => param.type === activeTab)
              .map((param) => (
                <div key={param.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) =>
                      updateParameter(param.id, "enabled", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) =>
                      updateParameter(param.id, "key", e.target.value)
                    }
                    placeholder="Key"
                    className="flex-1 px-2 py-1 border rounded-md text-sm"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) =>
                      updateParameter(param.id, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="flex-1 px-2 py-1 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => removeParameter(param.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            <button
              onClick={() => addParameter(activeTab)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab} parameter
            </button>
          </div>
        </div>

        {/* Right panel - Response */}
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <div className="border-b bg-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Response</span>
                {responseTime && (
                  <span className="text-xs text-gray-500">
                    ({responseTime}ms)
                  </span>
                )}
              </div>
              <div className="flex gap-1 text-sm">
                <button
                  onClick={() => setViewMode("pretty")}
                  className={`px-2 py-1 rounded ${
                    viewMode === "pretty"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Pretty
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={`px-2 py-1 rounded ${
                    viewMode === "raw"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Raw
                </button>
                <button
                  onClick={() => setViewMode("headers")}
                  className={`px-2 py-1 rounded ${
                    viewMode === "headers"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  Headers
                </button>
              </div>
            </div>
            {response && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowJsonEditor(!showJsonEditor)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyResponse}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadResponse}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div
            className="p-4 overflow-y-auto font-mono text-sm"
            style={{ height: "calc(100% - 49px)" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : response ? (
              viewMode === "headers" ? (
                <div className="space-y-1">
                  <div className="font-bold text-gray-700">
                    {response.status} {response.statusText}
                  </div>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <span className="text-gray-600">{key}:</span>
                      <span className="col-span-2 text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              ) : viewMode === "raw" ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(response.data)}
                </pre>
              ) : showJsonEditor ? (
                <textarea
                  value={editedJson}
                  onChange={(e) => setEditedJson(e.target.value)}
                  className="w-full h-full p-2 font-mono text-sm border rounded-md"
                />
              ) : (
                <pre>{JSON.stringify(response.data, null, 2)}</pre>
              )
            ) : (
              <div className="text-gray-500">
                Response will appear here after sending a request
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPlayground;
