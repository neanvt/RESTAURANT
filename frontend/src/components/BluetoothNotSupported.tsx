"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BluetoothNotSupportedProps {
  className?: string;
}

export default function BluetoothNotSupported({
  className,
}: BluetoothNotSupportedProps) {
  const handleEnableBluetooth = () => {
    window.open("chrome://flags/#enable-web-bluetooth", "_blank");
  };

  return (
    <div
      className={`border border-red-300 bg-red-50 p-4 rounded-lg ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <h3 className="font-medium text-red-800">Web Bluetooth Disabled</h3>

          <p className="text-sm text-red-700">
            Web Bluetooth API is disabled in your browser. To use Bluetooth
            printing features, please enable it in your browser settings.
          </p>

          <div className="space-y-2">
            <p className="font-medium text-red-800 text-sm">
              For Chrome users:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-red-700">
              <li>
                Open Chrome flags by typing{" "}
                <code className="bg-red-100 px-1 rounded text-xs">
                  chrome://flags/#enable-web-bluetooth
                </code>{" "}
                in your address bar
              </li>
              <li>
                Set "Experimental Web Platform features" to{" "}
                <strong>Enabled</strong>
              </li>
              <li>Restart your browser</li>
            </ol>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-red-800 text-sm">
              Alternative solutions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-700">
              <li>
                Use Chrome on Android (Web Bluetooth is enabled by default)
              </li>
              <li>Use Microsoft Edge with experimental features enabled</li>
              <li>
                KOTs will still be sent to your network/server printers as
                fallback
              </li>
            </ul>
          </div>

          <Button
            onClick={handleEnableBluetooth}
            variant="outline"
            size="sm"
            className="mt-3 border-red-300 text-red-800 hover:bg-red-100"
          >
            Open Chrome Flags
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
