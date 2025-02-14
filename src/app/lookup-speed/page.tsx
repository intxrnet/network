"use client";

import React, { useState } from "react";
import {
  Globe,
  Loader2,
  Timer,
  Signal,
  Info,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface NetworkResult {
  step: string;
  status: "success" | "error" | "pending";
  timeTaken?: number;
  info?: string;
  error?: string;
}

const NetworkAnalyzer = () => {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NetworkResult[]>([]);

  const performDNSLookup = async (hostname: string): Promise<void> => {
    try {
      const startTime = performance.now();

      // Using fetch with HEAD request to avoid downloading content
      const response = await fetch(`https://${hostname}`, {
        method: "HEAD",
        mode: "no-cors", // This allows us to at least attempt the connection
      });

      const endTime = performance.now();

      setResults((prev) => [
        ...prev,
        {
          step: "DNS Lookup",
          status: "success",
          timeTaken: Math.round(endTime - startTime),
          info: `Successfully resolved ${hostname}`,
        },
      ]);
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          step: "DNS Lookup",
          status: "error",
          error: "Failed to resolve hostname",
        },
      ]);
    }
  };

  const measureLatency = async (hostname: string): Promise<void> => {
    const measurements: number[] = [];

    for (let i = 0; i < 3; i++) {
      try {
        const startTime = performance.now();
        await fetch(`https://${hostname}`, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        const endTime = performance.now();
        measurements.push(endTime - startTime);

        // Add small delay between pings
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        // Continue with other measurements even if one fails
      }
    }

    if (measurements.length > 0) {
      const avgLatency = Math.round(
        measurements.reduce((a, b) => a + b) / measurements.length
      );
      setResults((prev) => [
        ...prev,
        {
          step: "Latency Test",
          status: "success",
          timeTaken: avgLatency,
          info: `Average response time from 3 requests`,
        },
      ]);
    } else {
      setResults((prev) => [
        ...prev,
        {
          step: "Latency Test",
          status: "error",
          error: "Could not measure latency",
        },
      ]);
    }
  };

  const getConnectionInfo = () => {
    const connection = (navigator as any).connection;

    if (connection) {
      setResults((prev) => [
        ...prev,
        {
          step: "Connection Info",
          status: "success",
          info: `Type: ${connection.effectiveType || "Unknown"}, 
               Downlink: ${connection.downlink || "Unknown"} Mbps, 
               RTT: ${connection.rtt || "Unknown"} ms`,
        },
      ]);
    } else {
      setResults((prev) => [
        ...prev,
        {
          step: "Connection Info",
          status: "error",
          error: "Connection information not available",
        },
      ]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    setLoading(true);
    setResults([]);

    const hostname = target.replace(/^https?:\/\//, "");

    try {
      await performDNSLookup(hostname);
      await measureLatency(hostname);
      getConnectionInfo();
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          step: "Analysis",
          status: "error",
          error: "Failed to complete network analysis",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-mono flex items-center gap-2">
          <Globe className="w-8 h-8" />
          Network Analyzer
        </h1>
      </div>

      <form onSubmit={handleAnalyze} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter domain (e.g., google.com)"
            className="flex-grow px-4 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !target.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Signal className="w-4 h-4" />
            )}
            Analyze
          </button>
          {results.length > 0 && !loading && (
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </form>

      <div className="flex-grow border rounded-lg overflow-hidden bg-gray-50">
        <div className="overflow-y-auto h-full p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Analyzing network path to {target}...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-white rounded-md shadow-sm">
                  <div className="flex items-center gap-3">
                    {result.status === "success" ? (
                      <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                        {result.timeTaken ? (
                          <Timer className="w-4 h-4" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="font-medium">{result.step}</div>
                      {result.status === "success" ? (
                        <div className="text-sm text-gray-600">
                          {result.info}
                          {result.timeTaken && (
                            <span className="ml-2 font-mono text-blue-600">
                              {result.timeTaken}ms
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Enter a domain to analyze network path and performance
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalyzer;
