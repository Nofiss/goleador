import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Componente per gestire le notifiche di aggiornamento della PWA.
 * Anche con registerType: 'autoUpdate', questo componente può mostrare un messaggio
 * quando l'app è pronta per l'uso offline o quando viene rilevato un aggiornamento.
 */
export function PwaUpdater() {
	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(_r) {
			console.log("PWA Service Worker registrato");
		},
		onRegisterError(error) {
			console.error("Errore registrazione PWA Service Worker", error);
		},
	});

	useEffect(() => {
		if (offlineReady) {
			toast.success("App pronta per l'uso offline", {
				description: "Goleador è ora disponibile anche senza connessione.",
			});
			setOfflineReady(false);
		}
	}, [offlineReady, setOfflineReady]);

	useEffect(() => {
		if (needRefresh) {
			toast.info("Nuova versione disponibile", {
				description: "L'applicazione è stata aggiornata con nuovi contenuti.",
				action: {
					label: "Ricarica",
					onClick: () => updateServiceWorker(true),
				},
				duration: Infinity,
			});
		}
	}, [needRefresh, updateServiceWorker]);

	return null;
}
