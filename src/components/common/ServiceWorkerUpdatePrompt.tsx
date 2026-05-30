import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

const UPDATE_TOAST_ID = "service-worker-update";
const OFFLINE_READY_TOAST_ID = "service-worker-offline-ready";

const ServiceWorkerUpdatePrompt = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast.info("Dostępna jest nowa wersja aplikacji", {
          id: UPDATE_TOAST_ID,
          description: "Możesz odświeżyć teraz albo kontynuować pracę i zrobić to później.",
          duration: Infinity,
          action: {
            label: "Odśwież",
            onClick: () => updateServiceWorker(true),
          },
          cancel: {
            label: "Później",
            onClick: () => toast.dismiss(UPDATE_TOAST_ID),
          },
        });
      },
      onOfflineReady() {
        toast.success("Aplikacja jest gotowa do pracy offline", {
          id: OFFLINE_READY_TOAST_ID,
          duration: 5000,
        });
      },
      onRegisterError() {
        toast.error("Nie udało się uruchomić trybu offline", {
          duration: 8000,
        });
      },
    });
  }, []);

  return null;
};

export default ServiceWorkerUpdatePrompt;
