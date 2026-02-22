import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Pill, Users, Settings, Plus } from 'lucide-react-native';


export default function PatientTabsLayout() {
    const router = useRouter();

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#19e66f',
                    tabBarInactiveTintColor: '#94a3b8',
                    tabBarStyle: {
                        height: 80,
                        paddingBottom: 24,
                        paddingTop: 12,
                        backgroundColor: '#ffffff',
                        borderTopWidth: 1,
                        borderTopColor: '#f1f5f9',
                        elevation: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        marginTop: 4,
                    }
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Home size={28} color={color} strokeWidth={2.5} />,
                    }}
                />
                <Tabs.Screen
                    name="plan"
                    options={{
                        title: 'Health',
                        tabBarIcon: ({ color }) => <Pill size={28} color={color} strokeWidth={2.5} />,
                    }}
                />
                <Tabs.Screen
                    name="family"
                    options={{
                        title: 'Family',
                        tabBarIcon: ({ color }) => <Users size={28} color={color} strokeWidth={2.5} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({ color }) => <Settings size={28} color={color} strokeWidth={2.5} />,
                    }}
                />
            </Tabs>
        </>
    );
}
