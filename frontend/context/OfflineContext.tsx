import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import syncManager from '../services/sync.manager';
import Constants from 'expo-constants'; // Pour savoir si on est en dev (optionnel)

interface OfflineContextType {
    isOffline: boolean;
    lastSyncStr: string | null;
    triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
    isOffline: false,
    lastSyncStr: null,
    triggerSync: async () => { },
});

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);

    // Ecouter l'état du réseau
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const offline = state.isConnected === false;
            setIsOffline(offline);

            // Si on repasse en ligne, on tente une synchro
            if (!offline && state.isConnected) {
                syncManager.synchronize();
            }
        });

        return () => unsubscribe();
    }, []);

    // Synchro initiale au lancement de l'app (si connecté)
    useEffect(() => {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                syncManager.synchronize();
            }
        });
    }, []);

    return (
        <OfflineContext.Provider value={{
            isOffline,
            lastSyncStr: null, // TODO: Connecter avec cacheService si on veut l'afficher
            triggerSync: syncManager.synchronize.bind(syncManager)
        }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => useContext(OfflineContext);
