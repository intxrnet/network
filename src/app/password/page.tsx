"use client";

import React, { useState, useEffect } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";

const PasswordGeneratorPlayground = () => {
  // Generation type: "password" (normal), "passphrase", "pin", "bulk"
  const [generationType, setGenerationType] = useState("password");
  // The generated (or manually edited) password output
  const [password, setPassword] = useState("");
  // For normal password & PIN length OR passphrase word count
  const [passwordLength, setPasswordLength] = useState(16);
  // For bulk generation: how many passwords to generate
  const [bulkCount, setBulkCount] = useState(5);

  // Options for normal password generation
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeSequential, setExcludeSequential] = useState(false);
  const [forceStartWithLetter, setForceStartWithLetter] = useState(false);

  // Options for passphrase generation
  const [wordSeparator, setWordSeparator] = useState("-");
  const [passphraseCapitalization, setPassphraseCapitalization] =
    useState(false);

  // A small word list for passphrase generation
  const wordList = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
    "india",
    "juliet",
    "kilo",
    "lima",
    "mike",
    "november",
    "oscar",
    "papa",
    "quebec",
    "romeo",
    "sierra",
    "tango",
    "uniform",
    "victor",
    "whiskey",
    "xray",
    "yankee",
    "zulu",
    "hazily",
    "control",
    "aviator",
    "mystic",
    "crimson",
    "shadow",
    "silent",
    "thunder",
    "storm",
    "rapid",
    "frozen",
    "ancient",
    "cosmic",
    "blazing",
  ];

  // Auto-generate a password on page load
  useEffect(() => {
    generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main generate function (switches based on generation type)
  const generatePassword = () => {
    let newPassword = "";
    if (generationType === "password") {
      newPassword = generateNormalPassword();
    } else if (generationType === "passphrase") {
      newPassword = generatePassphrase();
    } else if (generationType === "pin") {
      newPassword = generatePin();
    } else if (generationType === "bulk") {
      let passwords = [];
      for (let i = 0; i < bulkCount; i++) {
        passwords.push(generateNormalPassword());
      }
      newPassword = passwords.join("\n");
    }
    setPassword(newPassword);
  };

  // --------------------------
  // Generation Functions
  // --------------------------

  // Generate a normal password based on selected options
  const generateNormalPassword = () => {
    // Define basic character sets
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numbers = "0123456789";
    let symbols = "!@#$%^&*()_+[]{}|;:,.<>?`~\\-=";
    if (excludeAmbiguous) {
      const ambiguous = "Il1O0";
      lower = lower
        .split("")
        .filter((c) => !ambiguous.includes(c))
        .join("");
      upper = upper
        .split("")
        .filter((c) => !ambiguous.includes(c))
        .join("");
      numbers = numbers
        .split("")
        .filter((c) => !ambiguous.includes(c))
        .join("");
      symbols = symbols
        .split("")
        .filter((c) => !ambiguous.includes(c))
        .join("");
    }
    let charPool = "";
    if (includeLowercase) charPool += lower;
    if (includeUppercase) charPool += upper;
    if (includeNumbers) charPool += numbers;
    if (includeSymbols) charPool += symbols;
    if (!charPool) return "";

    let result = "";
    // If forced to start with a letter, choose from lower+upper if available
    if (forceStartWithLetter) {
      let letterPool = "";
      if (includeLowercase) letterPool += lower;
      if (includeUppercase) letterPool += upper;
      if (letterPool) {
        result += letterPool[Math.floor(Math.random() * letterPool.length)];
      } else {
        result += charPool[Math.floor(Math.random() * charPool.length)];
      }
    }
    // Build the rest of the password
    while (result.length < passwordLength) {
      let randomChar = charPool[Math.floor(Math.random() * charPool.length)];
      if (excludeSequential && result.length > 0) {
        const prevChar = result[result.length - 1];
        // Exclude duplicate characters...
        if (randomChar === prevChar) continue;
        // ...and avoid sequential characters (adjacent char codes differ by 1)
        if (Math.abs(randomChar.charCodeAt(0) - prevChar.charCodeAt(0)) === 1)
          continue;
      }
      result += randomChar;
    }
    return result;
  };

  // Generate a passphrase by selecting random words from the word list
  const generatePassphrase = () => {
    let words = [];
    const wordCount = passwordLength; // here, passwordLength is treated as word count
    for (let i = 0; i < wordCount; i++) {
      let word = wordList[Math.floor(Math.random() * wordList.length)];
      if (passphraseCapitalization) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }
    return words.join(wordSeparator);
  };

  // Generate a numeric-only PIN
  const generatePin = () => {
    let result = "";
    const digits = "0123456789";
    for (let i = 0; i < passwordLength; i++) {
      result += digits[Math.floor(Math.random() * digits.length)];
    }
    return result;
  };

  // --------------------------
  // Strength & Crack Time
  // --------------------------

  // Compute entropy (in bits) based on generation type and settings
  const computeEntropy = () => {
    let entropy = 0;
    if (generationType === "password" || generationType === "bulk") {
      let pool = 0;
      if (includeLowercase) pool += 26;
      if (includeUppercase) pool += 26;
      if (includeNumbers) pool += 10;
      if (includeSymbols) pool += 32; // roughly 32 symbols available
      if (excludeAmbiguous) {
        pool = Math.max(pool - 5, 1);
      }
      entropy = passwordLength * Math.log2(pool);
    } else if (generationType === "passphrase") {
      entropy = passwordLength * Math.log2(wordList.length);
    } else if (generationType === "pin") {
      entropy = passwordLength * Math.log2(10);
    }
    return entropy;
  };

  // Return a strength label based on entropy value
  const getStrengthLabel = (entropy: number) => {
    if (entropy < 40) return "Weak";
    else if (entropy < 60) return "Moderate";
    else if (entropy < 80) return "Strong";
    else return "Very Strong";
  };

  // Format estimated crack time (assuming 10^10 guesses per second)
  const formatCrackTime = (entropy: number) => {
    const guessesPerSecond = 1e10;
    const totalGuesses = Math.pow(2, entropy);
    const seconds = totalGuesses / guessesPerSecond;
    if (seconds < 1) return "less than a second";
    // If astronomical, say "practically uncrackable"
    if (seconds > 1e20) return "practically uncrackable";

    let time = seconds;
    const units = [
      { unit: "year", sec: 3600 * 24 * 365 },
      { unit: "day", sec: 3600 * 24 },
      { unit: "hour", sec: 3600 },
      { unit: "minute", sec: 60 },
      { unit: "second", sec: 1 },
    ];
    let result = [];
    for (const { unit, sec } of units) {
      const quotient = Math.floor(time / sec);
      if (quotient > 0) {
        result.push(`${quotient} ${unit}${quotient > 1 ? "s" : ""}`);
        time %= sec;
      }
    }
    return result.join(", ");
  };

  const entropy = computeEntropy();
  const strengthLabel = getStrengthLabel(entropy);
  const crackTime = formatCrackTime(entropy);

  // --------------------------
  // Handlers
  // --------------------------

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      alert("Password copied to clipboard!");
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPassword(e.target.value);
  };

  // --------------------------
  // Render UI
  // --------------------------

  return (
    <div className="flex flex-col h-[90vh] w-full p-4 bg-white">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h1 className="text-2xl font-mono">Password Generator Playground</h1>
        <div className="flex flex-wrap items-center gap-4">
          {/* Generation Type Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value)}
              className="px-2 py-1 border rounded-md bg-white"
            >
              <option value="password">Password</option>
              <option value="passphrase">Passphrase</option>
              <option value="pin">PIN</option>
              <option value="bulk">Bulk</option>
            </select>
          </div>
          {/* Regenerate & Copy Buttons */}
          <button
            onClick={generatePassword}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border rounded-md hover:bg-blue-100"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border rounded-md hover:bg-gray-100"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      </div>

      {/* Editable Password / Output Field */}
      <div className="mb-4">
        {generationType === "bulk" ? (
          <textarea
            value={password}
            onChange={handlePasswordChange}
            rows={Math.min(bulkCount, 10)}
            className="w-full p-2 border rounded-md font-mono text-sm resize-none"
          />
        ) : (
          <input
            type="text"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 border rounded-md font-mono text-sm"
          />
        )}
      </div>

      {/* Strength & Estimated Crack Time */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <span>
          Strength: <strong>{strengthLabel}</strong>
        </span>
        <span>Entropy: {entropy.toFixed(2)} bits</span>
        <span>Estimated Crack Time: {crackTime}</span>
      </div>

      {/* Customization Options */}
      <div className="flex flex-col gap-4">
        {/* Length / Word Count / PIN Length */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">
            {generationType === "passphrase" ? "Word Count:" : "Length:"}{" "}
            {passwordLength}
          </label>
          <input
            type="range"
            min={
              generationType === "pin"
                ? 4
                : generationType === "passphrase"
                ? 3
                : 8
            }
            max={
              generationType === "pin"
                ? 12
                : generationType === "passphrase"
                ? 8
                : 32
            }
            value={passwordLength}
            onChange={(e) => setPasswordLength(Number(e.target.value))}
            className="flex-grow"
          />
          {generationType === "bulk" && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">
                Bulk Count: {bulkCount}
              </label>
              <input
                type="range"
                min={2}
                max={20}
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="flex-grow"
              />
            </div>
          )}
        </div>

        {/* Options for normal password generation */}
        {(generationType === "password" || generationType === "bulk") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="form-checkbox"
              />
              Uppercase Letters (A-Z)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="form-checkbox"
              />
              Lowercase Letters (a-z)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="form-checkbox"
              />
              Numbers (0-9)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="form-checkbox"
              />
              Symbols &amp; Special Characters
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                className="form-checkbox"
              />
              Avoid Ambiguous Characters (I, l, 1, O, 0)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={excludeSequential}
                onChange={(e) => setExcludeSequential(e.target.checked)}
                className="form-checkbox"
              />
              Exclude Sequential/Duplicate Characters
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={forceStartWithLetter}
                onChange={(e) => setForceStartWithLetter(e.target.checked)}
                className="form-checkbox"
              />
              Force Password to Start with a Letter
            </label>
          </div>
        )}

        {/* Options for passphrase generation */}
        {generationType === "passphrase" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm">
              Word Separator:
              <input
                type="text"
                value={wordSeparator}
                onChange={(e) => setWordSeparator(e.target.value)}
                className="px-2 py-1 border rounded-md w-16"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={passphraseCapitalization}
                onChange={(e) => setPassphraseCapitalization(e.target.checked)}
                className="form-checkbox"
              />
              Include Capitalization
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGeneratorPlayground;
