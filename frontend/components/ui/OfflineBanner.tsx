import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useOffline } from '../../context/OfflineContext';

/**
 * Bannière affichée lorsque l'application est hors ligne
 */
const OfflineBanner: React.FC = () => {
    const { isOffline } = useOffline();
    const insets = useSafeAreaInsets();
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isOffline) {
            // Slide down
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide up
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isOffline]);

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
    });

    if (!isOffline) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={styles.content}>
                <Text style={styles.text}>Mode Hors-ligne (Consultation uniquement)</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.error || '#FF6B6B', // Fallback color
        zIndex: 9999,
        elevation: 5,
    },
    content: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
});

export default OfflineBanner;
