"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TokenInput from "@/components/TokenInput";
import PushProgress from "@/components/PushProgress";
import ActivityLog from "@/components/ActivityLog";
import PushSummary from "@/components/PushSummary";
import { useToast } from "@/components/Toast";
import { apiUrl, wsUrl } from "@/lib/api";

interface LogEntry {
  index: number;
  total: number;
  name: string;
  status: string;
  message: string;
}

interface PushResult {
  successful: number;
  failed: number;
  alreadyExists: number;
  total: number;
  errors: { index: number; name: string; error: string }[];
  alreadyExistsRecords: { index: number; name: string; message: string }[];
  credentialReportUrl: string;
}

export default function PushPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [sessionId, setSessionId] = useState("");
  const [validCount, setValidCount] = useState(0);
  const [token, setToken] = useState("");
  const [startIndex, setStartIndex] = useState(0);

  const [pushing, setPushing] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [successful, setSuccessful] = useState(0);
  const [failed, setFailed] = useState(0);
  const [alreadyExists, setAlreadyExists] = useState(0);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [completed, setCompleted] = useState(false);
  const [pushResult, setPushResult] = useState<PushResult | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const errorsRef = useRef<{ index: number; name: string; error: string }[]>([]);
  const alreadyExistsRef = useRef<{ index: number; name: string; message: string }[]>([]);

  useEffect(() => {
    const sid = sessionStorage.getItem("pushSessionId") || "";
    const vc = sessionStorage.getItem("pushValidCount") || "0";
    setSessionId(sid);
    setValidCount(Number(vc));
  }, []);

  const connectWebSocket = useCallback(
    (sid: string) => {
      const ws = new WebSocket(wsUrl(`/ws/push/${sid}`));
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setProcessed((p) => p + 1);
          if (data.status === "success") setSuccessful((s) => s + 1);
          else if (data.status === "already_exists") {
            setAlreadyExists((a) => a + 1);
            alreadyExistsRef.current.push({
              index: data.index,
              name: data.name,
              message: data.message,
            });
          } else {
            setFailed((f) => f + 1);
            errorsRef.current.push({
              index: data.index,
              name: data.name,
              error: data.message,
            });
          }

          setLogEntries((prev) => [
            ...prev,
            {
              index: data.index,
              total: data.total,
              name: data.name,
              status: data.status,
              message: data.message,
            },
          ]);
        } else if (data.type === "complete") {
          setCompleted(true);
          setPushing(false);
          setPushResult({
            successful: data.successful,
            failed: data.failed,
            alreadyExists: data.already_exists,
            total: data.successful + data.failed + data.already_exists,
            errors: errorsRef.current,
            alreadyExistsRecords: alreadyExistsRef.current,
            credentialReportUrl: data.credential_report_url || "",
          });
          toast("Push completed!", "success");
        } else if (data.type === "token_expired") {
          setTokenExpired(true);
          setPushing(false);
          setStartIndex(data.index);
          toast("Token expired! Please provide a new token and resume.", "warning");
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    },
    [toast]
  );

  const handleStartPush = async () => {
    if (!token.trim() || !sessionId) return;

    const confirmed = window.confirm(
      `You are about to create ${validCount} user accounts in PRODUCTION. This action cannot be undone. Continue?`
    );
    if (!confirmed) return;

    // Reset state
    setProcessed(0);
    setSuccessful(0);
    setFailed(0);
    setAlreadyExists(0);
    setLogEntries([]);
    setCompleted(false);
    setPushResult(null);
    setTokenExpired(false);
    errorsRef.current = [];
    alreadyExistsRef.current = [];

    // Connect WebSocket
    connectWebSocket(sessionId);

    // Start push
    try {
      const res = await fetch(apiUrl("/push/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          token: token.trim(),
          start_index: startIndex,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to start push" }));
        throw new Error(err.detail);
      }

      const data = await res.json();
      setTotal(data.total_users);
      setPushing(true);
      toast("Push started!", "info");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start push";
      toast(message, "error");
    }
  };

  const handleStop = async () => {
    try {
      const res = await fetch(apiUrl("/push/stop"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast(`Push stopping at index ${data.last_processed_index}...`, "warning");
      }
    } catch {
      toast("Failed to stop push", "error");
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No session found. Please upload a file first.</p>
        <button
          onClick={() => router.push("/upload")}
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Push to Production</h1>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-green-500" : "bg-slate-300"
              }`}
          />
          <span className="text-xs text-slate-400">
            {wsConnected ? "WS Connected" : "WS Disconnected"}
          </span>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
        <p>
          <span className="text-slate-500">Session:</span>{" "}
          <span className="font-mono">{sessionId.slice(0, 8)}...</span>
        </p>
        <p>
          <span className="text-slate-500">Valid Users:</span>{" "}
          <span className="font-bold">{validCount}</span>
        </p>
      </div>

      {/* Token expired alert */}
      {tokenExpired && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">
            ⚠️ Token expired! Push paused at record {startIndex}.
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Please provide a new token and click Resume.
          </p>
        </div>
      )}

      {/* Pre-push */}
      {!completed && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <TokenInput token={token} onChange={setToken} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Index (for resuming)
            </label>
            <input
              type="number"
              min={0}
              value={startIndex}
              onChange={(e) => setStartIndex(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              disabled={!token.trim() || pushing}
              onClick={handleStartPush}
              className="flex-1 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tokenExpired ? "Resume Push" : "Start Push"}
            </button>
            {pushing && (
              <button
                onClick={handleStop}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live progress */}
      {(pushing || completed) && (
        <div className="space-y-4">
          <PushProgress
            processed={processed}
            total={total}
            successful={successful}
            failed={failed}
            alreadyExists={alreadyExists}
          />
          <ActivityLog entries={logEntries} />
        </div>
      )}

      {/* Post-push  summary */}
      {completed && pushResult && <PushSummary result={pushResult} />}
    </div>
  );
}
