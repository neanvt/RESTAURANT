"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { BluetoothNotSupported } from "@/components/BluetoothNotSupported";
import {
  Bluetooth,
  BluetoothConnected,
  Printer,
  TestTube,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Smartphone,
  Wifi,
} from "lucide-react";

export default function PrinterSettingsPage() {
  const {
    isSupported,
    isConnected,
    isConnecting,
    isPrinting,
    connect,
    disconnect,
    printTest,
  } = useBluetoothPrinter();

  useEffect(() => {
    // Check if running on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);

    if (!isMobile) {
      console.warn("Bluetooth printing works best on mobile devices");
    }
    if (!isChrome) {
      console.warn("Bluetooth printing requires Chrome browser");
    }
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bluetooth Printer</h1>
        <p className="text-gray-600 mt-1">
          Connect and configure your Bluetooth thermal printer
        </p>
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  Bluetooth Not Available
                </h3>
                <p className="text-sm text-red-800 mt-1 mb-4">
                  Web Bluetooth is not supported or has been disabled in your
                  browser.
                </p>
                <BluetoothNotSupported />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Connection
          </CardTitle>
          <CardDescription>
            Connect to your Bluetooth thermal printer (58mm)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {isConnected ? (
                <Badge variant="default" className="bg-green-500 gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  Disconnected
                </Badge>
              )}
            </div>

            {isConnected && (
              <BluetoothConnected className="h-5 w-5 text-blue-500 animate-pulse" />
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isConnected ? (
              <Button
                onClick={connect}
                disabled={!isSupported || isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Bluetooth className="mr-2 h-4 w-4" />
                    Connect Printer
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="flex-1"
                >
                  <Bluetooth className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
                <Button
                  onClick={printTest}
                  disabled={isPrinting}
                  className="flex-1"
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Printing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Print Test
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect your Bluetooth printer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                1
              </span>
              <div>
                <strong>Power on your printer</strong>
                <p className="text-gray-600 mt-0.5">
                  Turn on your Bluetooth thermal printer (e.g., Shreyans SC588,
                  RPP02N, etc.)
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                2
              </span>
              <div>
                <strong>Enable pairing mode</strong>
                <p className="text-gray-600 mt-0.5">
                  Make sure your printer is in Bluetooth pairing mode (usually
                  indicated by a blinking LED)
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                3
              </span>
              <div>
                <strong>Use Chrome on Android</strong>
                <p className="text-gray-600 mt-0.5">
                  Open this page in Google Chrome browser on your Android device
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                4
              </span>
              <div>
                <strong>Click "Connect Printer"</strong>
                <p className="text-gray-600 mt-0.5">
                  Select your printer from the Bluetooth device list
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                5
              </span>
              <div>
                <strong>Test the connection</strong>
                <p className="text-gray-600 mt-0.5">
                  Click "Print Test" to verify your printer is working correctly
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Supported Printers */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Printers</CardTitle>
          <CardDescription>
            Compatible Bluetooth thermal printers (58mm)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Shreyans SC588</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>RPP02N / RPP300</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>MTP-II / MTP-3</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>GOOJPRT PT-210</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Xprinter XP-P300</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>ESC/POS Compatible</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Most 58mm Bluetooth thermal printers that
              support ESC/POS commands should work with this system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-gray-900">Printer not found?</strong>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1 ml-2">
                <li>Make sure the printer is powered on and charged</li>
                <li>Ensure Bluetooth is enabled on your Android device</li>
                <li>Check if the printer is in pairing mode (blinking LED)</li>
                <li>Try turning the printer off and on again</li>
              </ul>
            </div>

            <Separator />

            <div>
              <strong className="text-gray-900">Connection failed?</strong>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1 ml-2">
                <li>Grant Bluetooth permissions when Chrome asks</li>
                <li>Move closer to the printer (within 10 meters)</li>
                <li>
                  Unpair the printer from Android Bluetooth settings and try
                  again
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <strong className="text-gray-900">Print output issues?</strong>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1 ml-2">
                <li>Check if the printer has paper loaded</li>
                <li>Verify the paper roll is inserted correctly</li>
                <li>Clean the printer head if text is faded</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
