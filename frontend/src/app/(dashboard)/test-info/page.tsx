"use client";

import { useEffect, useState } from "react";
import { useOutletStore } from "@/store/outletStore";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TestInfoPage() {
  const { currentOutlet } = useOutletStore();
  const [copied, setCopied] = useState(false);
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    if (currentOutlet?._id) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      setMenuUrl(`${baseUrl}/menu-select?outletId=${currentOutlet._id}`);
    }
  }, [currentOutlet]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentOutlet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Test Information</h1>
          <p className="text-red-600">
            Please log in and select an outlet first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🧪 Test Information</h1>

          <div className="space-y-4">
            {/* Outlet ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Outlet ID:
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-4 py-2 rounded border text-sm">
                  {currentOutlet._id}
                </code>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(currentOutlet._id)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Outlet Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Outlet Name:
              </label>
              <p className="bg-gray-50 px-4 py-2 rounded border">
                {currentOutlet.businessName}
              </p>
            </div>

            {/* Menu URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Menu Selection URL (for testing):
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-blue-50 px-4 py-2 rounded border text-sm break-all">
                  {menuUrl}
                </code>
                <Button size="sm" onClick={() => copyToClipboard(menuUrl)}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🔗 Quick Test Links</h2>
          <div className="space-y-2">
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-center font-semibold transition-colors"
            >
              Open Menu Selection Page
            </a>
            <a
              href={`/menu-current`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-center font-semibold transition-colors"
            >
              Open Current Menu
            </a>
            <a
              href={`/menu-full`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-semibold transition-colors"
            >
              Open Full Menu
            </a>
            <a
              href={`/menu-print`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-center font-semibold transition-colors"
            >
              Open Print Menu (with QR codes)
            </a>
          </div>
        </div>

        {/* Mobile Testing Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
          <h3 className="font-bold text-amber-900 mb-2">📱 Mobile Testing</h3>
          <p className="text-sm text-amber-800 mb-2">
            To test on mobile (same WiFi network):
          </p>
          <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1">
            <li>Find your computer's IP address</li>
            <li>Replace "localhost:3000" with "YOUR_IP:3000"</li>
            <li>Use the menu URL with outlet ID</li>
          </ol>
          <div className="mt-3 bg-white rounded p-3">
            <code className="text-xs">ipconfig getifaddr en0</code>
          </div>
        </div>
      </div>
    </div>
  );
}
