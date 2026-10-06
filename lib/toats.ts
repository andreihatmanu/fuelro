"use client";

import { showToast } from "nextjs-toast-notify";

const toastOptions = {
  duration: 4000,
  position: "bottom-center" as const,
  transition: "slideInUp" as const,
  progress: true,
};

export function success(message: string) {
  showToast.success(message, toastOptions);
}

export function error(message: string) {
  showToast.error(message, toastOptions);
}

export function warning(message: string) {
  showToast.warning(message, toastOptions);
}

export function info(message: string) {
  showToast.info(message, toastOptions);
}