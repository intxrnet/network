"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownUp, Copy, Trash2, Download } from "lucide-react";

const EncodingPage = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [inputFormat, setInputFormat] = useState("text");
  const [outputFormat, setOutputFormat] = useState("base64");

  const encodingFormats = [
    { value: "text", label: "Plain Text" },
    { value: "base64", label: "Base64" },
    { value: "hex", label: "Hexadecimal" },
    { value: "binary", label: "Binary" },
    { value: "uri", label: "URI Component" },
    { value: "url", label: "URL Encoded" },
    { value: "ascii", label: "ASCII" },
    { value: "unicode", label: "Unicode" },
    { value: "html", label: "HTML Entities" },
  ];

  const convertToBase = (text: string, fromFormat: string): string => {
    try {
      switch (fromFormat) {
        case "text":
          return text;
        case "base64":
          return atob(text);
        case "hex":
          return (
            text
              .match(/.{1,2}/g)
              ?.map((byte) => String.fromCharCode(parseInt(byte, 16)))
              .join("") || ""
          );
        case "binary":
          return (
            text
              .replace(/\s/g, "")
              .match(/.{1,8}/g)
              ?.map((byte) => String.fromCharCode(parseInt(byte, 2)))
              .join("") || ""
          );
        case "uri":
          return decodeURIComponent(text);
        case "url":
          return decodeURI(text);
        case "ascii":
          return text
            .split(",")
            .map((num) => String.fromCharCode(parseInt(num.trim())))
            .join("");
        case "unicode":
          return text
            .split("\\u")
            .filter(Boolean)
            .map((hex) => String.fromCharCode(parseInt(hex, 16)))
            .join("");
        case "html":
          const doc = new DOMParser().parseFromString(text, "text/html");
          return doc.body.textContent || "";
        default:
          return text;
      }
    } catch (err) {
      console.error(`Conversion from ${fromFormat} failed:`, err);
      return "Invalid input for selected format";
    }
  };

  const convertFromBase = (text: string, toFormat: string): string => {
    try {
      switch (toFormat) {
        case "text":
          return text;
        case "base64":
          return btoa(text);
        case "hex":
          return Array.from(text)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
            .join("");
        case "binary":
          return Array.from(text)
            .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join(" ");
        case "uri":
          return encodeURIComponent(text);
        case "url":
          return encodeURI(text);
        case "ascii":
          return Array.from(text)
            .map((char) => char.charCodeAt(0))
            .join(", ");
        case "unicode":
          return Array.from(text)
            .map(
              (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")
            )
            .join("");
        case "html":
          return text.replace(/[<>&"']/g, (char) => {
            const entities: { [key: string]: string } = {
              "<": "&lt;",
              ">": "&gt;",
              "&": "&amp;",
              '"': "&quot;",
              "'": "&#39;",
            };
            return entities[char] || char;
          });
        default:
          return text;
      }
    } catch (err) {
      console.error(`Conversion to ${toFormat} failed:`, err);
      return "Conversion error";
    }
  };

  const handleConvert = () => {
    if (!input) return;
    const baseText = convertToBase(input, inputFormat);
    const result = convertFromBase(baseText, outputFormat);
    setOutput(result);
  };

  useEffect(() => {
    handleConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, inputFormat, outputFormat]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleClear = (field: "input" | "output") => {
    if (field === "input") {
      setInput("");
    } else {
      setOutput("");
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `Input (${inputFormat}):\n${input}\n\nOutput (${outputFormat}):\n${output}`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encoding-conversion.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-mono font-bold text-gray-800">
              Encoding Converter
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {encodingFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(input)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleClear("input")}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to encode/decode..."
                rows={10}
              />
            </div>

            {/* Convert Button */}
            <div className="flex items-center justify-center md:hidden">
              <button
                onClick={handleSwap}
                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {encodingFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(output)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleClear("output")}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                className="flex-grow p-3 border rounded-md font-mono text-sm bg-gray-50 resize-none focus:outline-none"
                placeholder="Converted text will appear here..."
                rows={10}
              />
            </div>
          </div>

          {/* Swap Button (Desktop) */}
          <div className="hidden md:flex justify-center mt-4">
            <button
              onClick={handleSwap}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <ArrowDownUp className="w-4 h-4" />
              Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncodingPage;
