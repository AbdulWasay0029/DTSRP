import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Bell, Moon, Shield, Lock, Users, LogOut, Edit2, X } from 'lucide-react-native';
import { useAuthStore } from '../../../libs/store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { profile, logout, updateProfileName, updateUserPassword, toggleNotificationSounds, theme, setTheme } = useAuthStore();
  const router = useRouter();
  const [notifSounds, setNotifSounds] = useState(profile?.notificationSounds ?? true);

  // Modals state
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [passVisible, setPassVisible] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await updateProfileName(newName.trim());
      setEditNameVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePass = async () => {
    if (newPass.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    setLoading(true);
    try {
      await updateUserPassword(newPass);
      setPassVisible(false);
      setNewPass('');
      Alert.alert('Success', 'Password updated successfully.');
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        Alert.alert('Authentication Error', 'This operation requires recent authentication. Please log out and sign back in.');
      } else {
        Alert.alert('Error', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSounds = (val: boolean) => {
    setNotifSounds(val);
    toggleNotificationSounds(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.profileCard} onPress={() => { setNewName(profile?.name || ''); setEditNameVisible(true); }} activeOpacity={0.8}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${profile?.name || 'Patient'}&background=19e66f&color=fff` }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Edit2 size={12} color="#fff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profileRole}>Patient</Text>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </View>
        </TouchableOpacity>

        {/* App Settings Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}><Bell size={20} color="#19e66f" /></View>
                <Text style={styles.settingLabel}>Notification Sounds</Text>
              </View>
              <Switch
                value={notifSounds}
                onValueChange={handleToggleSounds}
                trackColor={{ false: '#e2e8f0', true: '#19e66f' }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}><Moon size={20} color="#19e66f" /></View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                trackColor={{ false: '#e2e8f0', true: '#19e66f' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}><Shield size={20} color="#19e66f" /></View>
                <Text style={styles.settingLabel}>Data Privacy</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemLast]}
              activeOpacity={0.7}
              onPress={() => { setNewPass(''); setPassVisible(true); }}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}><Lock size={20} color="#19e66f" /></View>
                <Text style={styles.settingLabel}>Change Password</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Caregivers Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR CAREGIVERS</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]} onPress={() => router.push('/(patient)/(tabs)/family')} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.iconBox}><Users size={20} color="#19e66f" /></View>
                <Text style={styles.settingLabel}>Manage Connections</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>VERSION 2.4.0 (BUILD 891)</Text>

      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={editNameVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditNameVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleUpdateName} disabled={loading}>
              {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.modalBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPassVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Min 6 characters"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleChangePass} disabled={loading}>
              {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.modalBtnText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a' },

  content: { padding: 24, paddingBottom: 100 },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(25, 230, 111, 0.05)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(25, 230, 111, 0.1)', marginBottom: 32 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#19e66f', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  profileRole: { fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 2, marginBottom: 4 },
  editProfileText: { fontSize: 14, fontWeight: '600', color: '#19e66f' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  settingsGroup: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingItemLast: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#e8fdf1', alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '500', color: '#0f172a' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: 16 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },

  versionText: { fontSize: 10, fontWeight: '600', color: '#cbd5e1', textAlign: 'center', marginTop: 32, letterSpacing: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  modalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, fontSize: 16, color: '#0f172a', marginBottom: 24 },
  modalBtn: { backgroundColor: '#19e66f', padding: 16, borderRadius: 16, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#0f172a' }
});
