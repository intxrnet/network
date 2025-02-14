"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Copy,
  Trash2,
  Download,
  ArrowDownUp,
} from "lucide-react";
import CryptoJS from "crypto-js";

type EncryptionMethod =
  | "AES"
  | "DES"
  | "TripleDES"
  | "Rabbit"
  | "RC4"
  | "RC4Drop";

interface EncryptionResult {
  encrypted: string;
  method: EncryptionMethod;
}

const EncryptionPage = () => {
  const [input, setInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [results, setResults] = useState<EncryptionResult[]>([]);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  const encryptionMethods: EncryptionMethod[] = [
    "AES",
    "DES",
    "TripleDES",
    "Rabbit",
    "RC4",
    "RC4Drop",
  ];

  const encrypt = (text: string, method: EncryptionMethod): string => {
    if (!text || !passphrase) return "";

    try {
      switch (method) {
        case "AES":
          return CryptoJS.AES.encrypt(text, passphrase).toString();
        case "DES":
          return CryptoJS.DES.encrypt(text, passphrase).toString();
        case "TripleDES":
          return CryptoJS.TripleDES.encrypt(text, passphrase).toString();
        case "Rabbit":
          return CryptoJS.Rabbit.encrypt(text, passphrase).toString();
        case "RC4":
          return CryptoJS.RC4.encrypt(text, passphrase).toString();
        case "RC4Drop":
          return CryptoJS.RC4Drop.encrypt(text, passphrase).toString();
        default:
          return "";
      }
    } catch (err) {
      console.error(`Encryption failed for ${method}:`, err);
      return "Encryption failed";
    }
  };

  const decrypt = (text: string, method: EncryptionMethod): string => {
    if (!text || !passphrase) return "";

    try {
      switch (method) {
        case "AES":
          return CryptoJS.AES.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        case "DES":
          return CryptoJS.DES.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        case "TripleDES":
          return CryptoJS.TripleDES.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        case "Rabbit":
          return CryptoJS.Rabbit.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        case "RC4":
          return CryptoJS.RC4.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        case "RC4Drop":
          return CryptoJS.RC4Drop.decrypt(text, passphrase).toString(
            CryptoJS.enc.Utf8
          );
        default:
          return "";
      }
    } catch (err) {
      console.error(`Decryption failed for ${method}:`, err);
      return "Decryption failed";
    }
  };

  const handleProcess = () => {
    if (!input || !passphrase) return;

    if (mode === "encrypt") {
      const newResults = encryptionMethods.map((method) => ({
        encrypted: encrypt(input, method),
        method,
      }));
      setResults(newResults);
    } else {
      // Try decrypting with each method
      const newResults = encryptionMethods.map((method) => ({
        encrypted: decrypt(input, method),
        method,
      }));
      setResults(newResults);
    }
  };

  useEffect(() => {
    handleProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, passphrase, mode]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleClear = () => {
    setInput("");
    setResults([]);
  };

  const handleDownload = () => {
    const content = results
      .map((result) => `${result.method}:\n${result.encrypted}\n`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}-results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-mono flex items-center gap-2">
          {mode === "encrypt" ? (
            <Lock className="w-8 h-8" />
          ) : (
            <Unlock className="w-8 h-8" />
          )}
          Encryption Playground
        </h1>
        <button
          onClick={() => setMode(mode === "encrypt" ? "decrypt" : "encrypt")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          <ArrowDownUp className="w-4 h-4" />
          Switch to {mode === "encrypt" ? "Decrypt" : "Encrypt"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter passphrase..."
              className="flex-grow px-4 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[calc(100vh-280px)] p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter text to ${mode}...`}
          />
        </div>

        {/* Results Section */}
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <div className="border-b bg-white p-2 flex items-center justify-between">
            <span className="text-sm font-medium">Results</span>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div
            className="p-4 space-y-4 overflow-y-auto"
            style={{ height: "calc(100vh - 280px)" }}
          >
            {results.map((result, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {result.method}
                  </span>
                  <button
                    onClick={() => handleCopy(result.encrypted)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="p-3 bg-white border rounded-md text-sm font-mono overflow-x-auto">
                  {result.encrypted || "Invalid input"}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionPage;
