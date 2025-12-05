import React, { useMemo, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui.js/utils";

type InputKind = "address" | "dotSui" | "handle" | "unknown";

interface CheckResult {
  original: string;
  kind: InputKind;
  resolvedAddress?: string;
  valid: boolean;
  error?: string;
}

function classifyInput(raw: string): InputKind {
  if (raw.endsWith(".sui")) return "dotSui";
  if (raw.startsWith("@")) return "handle";
  if (raw.startsWith("0x")) return "address";
  return "unknown";
}

export const AddressCheckerApp: React.FC = () => {
  const suiClient = useSuiClient();
  const [rawList, setRawList] = useState("");
  const [resolveDotSui, setResolveDotSui] = useState(true);
  const [resolveHandles, setResolveHandles] = useState(true);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const lines = useMemo(
    () =>
      rawList
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
    [rawList],
  );

  async function resolveName(name: string): Promise<string | undefined> {
    try {
      const address = await suiClient.resolveNameServiceAddress({ name });
      return address ?? undefined;
    } catch {
      return undefined;
    }
  }

  async function handleCheck() {
    setIsChecking(true);
    const out: CheckResult[] = [];

    for (const line of lines) {
      const kind = classifyInput(line);

      if (kind === "address") {
        if (!isValidSuiAddress(line)) {
          out.push({
            original: line,
            kind,
            valid: false,
            error: "Invalid Sui address format",
          });
          continue;
        }
        out.push({
          original: line,
          kind,
          resolvedAddress: normalizeSuiAddress(line),
          valid: true,
        });
        continue;
      }

      if (kind === "dotSui" && resolveDotSui) {
        const resolved = await resolveName(line);
        if (!resolved) {
          out.push({
            original: line,
            kind,
            valid: false,
            error: "Domain not found",
          });
          continue;
        }
        out.push({
          original: line,
          kind,
          resolvedAddress: normalizeSuiAddress(resolved),
          valid: true,
        });
        continue;
      }

      if (kind === "handle" && resolveHandles) {
        const name = `${line.slice(1)}.sui`;
        const resolved = await resolveName(name);
        if (!resolved) {
          out.push({
            original: line,
            kind,
            valid: false,
            error: "Handle not found",
          });
          continue;
        }
        out.push({
          original: line,
          kind,
          resolvedAddress: normalizeSuiAddress(resolved),
          valid: true,
        });
        continue;
      }

      out.push({
        original: line,
        kind,
        valid: false,
        error:
          "Unsupported input type (enable resolution options or provide 0x address/.sui/@handle)",
      });
    }

    setResults(out);
    setIsChecking(false);
  }

  function exportCsv() {
    if (results.length === 0) return;

    const headers = [
      "input",
      "type",
      "resolved_address",
      "valid",
      "error",
    ];

    const rows = results.map((r) =>
      [
        r.original,
        r.kind,
        r.resolvedAddress ?? "",
        r.valid ? "true" : "false",
        r.error ?? "",
      ].map((field) => {
        const value = String(field);
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sui-address-checker.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Sui Address Checker</h1>
        <p className="subtitle">
          Paste a list of Sui wallet identifiers to validate and resolve them.
        </p>

        <label className="label">
          Wallet identifiers
          <textarea
            rows={10}
            placeholder={"One per line: 0x..., example.sui, @handle"}
            value={rawList}
            onChange={(e) => setRawList(e.target.value)}
          />
        </label>

        <div className="options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={resolveDotSui}
              onChange={(e) => setResolveDotSui(e.target.checked)}
            />
            Resolve <code>.sui</code> domains
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={resolveHandles}
              onChange={(e) => setResolveHandles(e.target.checked)}
            />
            Resolve <code>@handle</code> to Sui wallet address
          </label>
        </div>

        <div className="actions-row">
          <button
            className="primary-btn"
            onClick={handleCheck}
            disabled={isChecking || lines.length === 0}
          >
            {isChecking ? "✨ Checking..." : "🚀 Check Addresses"}
          </button>
          <button
            className="secondary-btn"
            onClick={exportCsv}
            disabled={results.length === 0}
          >
            📤 Export CSV
          </button>
        </div>

        {results.length > 0 && (
          <div className="results">
            <h2>Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Type</th>
                  <th>Resolved / Normalized Address</th>
                  <th>Status</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.original}>
                    <td>{r.original}</td>
                    <td>{r.kind}</td>
                    <td className="mono">
                      {r.resolvedAddress ?? "—"}
                    </td>
                    <td className={r.valid ? "ok" : "bad"}>
                      {r.valid ? "Valid" : "Invalid"}
                    </td>
                    <td>{r.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


