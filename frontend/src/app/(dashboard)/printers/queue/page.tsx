"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PrintJob {
  id: string;
  type: "receipt" | "kot" | "label";
  printerName: string;
  status: "pending" | "printing" | "completed" | "failed";
  createdAt: string;
  document: string;
}

export default function PrintQueuePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<PrintJob[]>([
    {
      id: "1",
      type: "receipt",
      printerName: "Main Receipt Printer",
      status: "completed",
      createdAt: new Date(Date.now() - 300000).toString(),
      document: "Invoice #1234",
    },
    {
      id: "2",
      type: "kot",
      printerName: "Kitchen Printer",
      status: "completed",
      createdAt: new Date(Date.now() - 600000).toString(),
      document: "KOT #5678",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleRetry = (jobId: string) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: "pending" as const } : job
      )
    );
  };

  const handleCancel = (jobId: string) => {
    setJobs(jobs.filter((job) => job.id !== jobId));
  };

  const handleClearCompleted = () => {
    setJobs(jobs.filter((job) => job.status !== "completed"));
  };

  const getStatusIcon = (status: PrintJob["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "printing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PrintJob["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "printing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
    }
  };

  const pendingJobs = jobs.filter(
    (j) => j.status === "pending" || j.status === "printing"
  );
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Print Queue</h1>
                <p className="text-sm text-gray-600">
                  {jobs.length} total jobs
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingJobs.length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedJobs.length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {failedJobs.length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {completedJobs.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearCompleted}
          >
            Clear Completed Jobs
          </Button>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Print Jobs
              </h3>
              <p className="text-gray-600">
                Print jobs will appear here when you print documents
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        getStatusColor(job.status)
                      )}
                    >
                      {getStatusIcon(job.status)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-gray-900">
                          {job.document}
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getStatusColor(job.status))}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Printer: {job.printerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </div>

                      {/* Actions */}
                      {job.status === "failed" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(job.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(job.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
