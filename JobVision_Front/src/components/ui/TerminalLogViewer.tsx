import React from "react";
import { Copy } from "lucide-react";
import { LogsOutputDTO } from "../../types/LogsOutputDTO.ts";
import { Button } from "./Button.tsx";

interface TerminalLogViewerProps {
    logs?: LogsOutputDTO[];
    executionState?: string;
}

// 🔥 Fonction robuste pour décoder en UTF-8 quel que soit le format reçu
const decodeToUtf8 = (input?: string): string => {
    if (!input) return "";

    let str = input;

    try {
        // 1) Si la chaîne contient des séquences échappées \uXXXX → décodage JSON
        if (/\\u[0-9a-fA-F]{4}/.test(str) || /\\\\u[0-9a-fA-F]{4}/.test(str)) {
            const normalized = str.replace(/\\\\u([0-9a-fA-F]{4})/g, "\\u$1");
            str = JSON.parse(`"${normalized.replace(/"/g, '\\"')}"`);
        }
    } catch {
        /* ignorer les erreurs */
    }

    try {
        // 2) Si mojibake type "gÃ©nÃ©rÃ©", corriger en réinterprétant comme Latin-1 → UTF-8
        if (/[ÃÂ]/.test(str)) {
            const bytes = new Uint8Array(Array.from(str).map((c) => c.charCodeAt(0) & 0xff));
            str = new TextDecoder("utf-8").decode(bytes);
        }
    } catch {
        /* ignorer */
    }

    return str;
};

const TerminalLogViewer: React.FC<TerminalLogViewerProps> = ({
                                                                 logs = [],
                                                                 executionState,
                                                             }) => {
    const getLogColorClass = (message: string | undefined): string => {
        if (!message) return "text-gray-300"; // neutre si pas de message

        const msg = message.toUpperCase();

        if (msg.includes("ERROR") || msg.includes("ERREUR")) return "text-red-400";
        if (msg.includes("WARNING") || msg.includes("AVERTISSEMENT")) return "text-yellow-400";
        if (msg.includes("SUCCESS") || msg.includes("SUCCÈS")) return "text-green-400";
        if (msg.includes("FAILED") || msg.includes("FAIL") || msg.includes("ÉCHEC"))
            return "text-red-300";

        return "text-gray-300";
    };

    return (
        <div className="mt-4 bg-gray-900 dark:bg-gray-800 rounded-lg p-3 max-h-64 overflow-auto">
            {logs.length > 0 ? (
                <div className="space-y-1 text-xs font-terminal text-gray-300 min-w-full">
                    {logs.map((log, index) => {
                        const decoded = decodeToUtf8(log.logMessage || "");
                        return (
                            <div key={index} className="flex justify-between items-start gap-2 group">
                                <div className={`whitespace-pre-wrap break-words flex-1 ${getLogColorClass(decoded)}`}>
                                    <span className="text-gray-400">{log.localTime}</span>
                                    <span className="text-white"> : </span>
                                    <span>{decoded}</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                    onClick={() => navigator.clipboard.writeText(decoded)}
                                    title="Copy log"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-xs font-terminal text-gray-400 italic">
                    {executionState === "RUNNING"
                        ? "Logs will be available once the execution is complete..."
                        : "No logs available for this execution"}
                </div>
            )}
        </div>
    );
};

export default TerminalLogViewer;
