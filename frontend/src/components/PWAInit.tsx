"use client";

import { useEffect } from "react";
import { initPWA } from "@/lib/pwa";

export default function PWAInit() {
  useEffect(() => {
    initPWA();
  }, []);

  return null;
}
