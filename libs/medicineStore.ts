import { create } from 'zustand';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, query, where, getDocs, onSnapshot, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuthStore } from './store';
import { scheduleMedicineNotifications, cancelMedicineNotifications, syncAllNotifications } from './notifications';

export interface Medicine {
    id: string;
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    startDate: string;
    endDate: string;
    mealRelation: string;
    reminderEnabled: boolean;
    notificationIds?: string[];
}

export interface MedLog {
    id: string;
    medicineId: string;
    date: string;
    status: 'taken' | 'missed';
    expectedTime?: string;
}

export interface Connection {
    id: string;
    patientId: string;
    caregiverId: string;
    status: 'pending' | 'approved';
}

export interface PatientUser {
    id: string;
    name: string;
    inviteCode: string;
    email: string;
}

interface MedicineState {
    medicines: Medicine[];
    logs: MedLog[];
    connections: Connection[];
    patients: PatientUser[];
    loading: boolean;
    fetchPatientData: () => void;
    fetchCaregiverData: () => void;
    addMedicine: (med: Omit<Medicine, 'id'>) => Promise<void>;
    updateMedicine: (id: string, med: Partial<Medicine>) => Promise<void>;
    deleteMedicine: (id: string) => Promise<void>;
    markTaken: (medicineId: string, status: 'taken' | 'missed', timeStr?: string) => Promise<void>;
    connectPatient: (inviteCode: string) => Promise<void>;
    approveConnection: (connectionId: string) => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
    medicines: [],
    logs: [],
    connections: [],
    patients: [],
    loading: false,

    fetchPatientData: () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Listen to Medicines
        const qMeds = query(collection(db, 'Medicines'), where('patientId', '==', user.uid));
        onSnapshot(qMeds, (snapshot) => {
            const ms: Medicine[] = [];
            snapshot.forEach((doc) => ms.push({ id: doc.id, ...doc.data() } as Medicine));
            set({ medicines: ms });

            // Sync local notifications for all active meds purely on startup/fetch
            syncAllNotifications(ms).catch(console.error);
        });

        // Listen to Logs
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const qLogs = query(collection(db, 'Logs'), where('date', '>=', startOfDay.toISOString()));
        onSnapshot(qLogs, async (snapshot) => {
            const ls: MedLog[] = [];
            snapshot.forEach((doc) => ls.push({ id: doc.id, ...doc.data() } as MedLog));
            // Only keep logs for the patient's medicines
            const meds = get().medicines;
            const medsIds = meds.map(m => m.id);
            const myLogs = ls.filter(l => medsIds.includes(l.medicineId));
            set({ logs: myLogs });

            // Detect Missed Doses
            const nowMs = Date.now();
            const todayStr = new Date().toISOString().split('T')[0];
            const batch = writeBatch(db);
            let hasMissed = false;

            meds.forEach(med => {
                med.times.forEach(t => {
                    const deterministicId = `${med.id}_${todayStr}_${t.replace(/[\s:]/g, '')}`;

                    // check if log exists deterministically, or via basic legacy mapping
                    const takenOrMissedLog = myLogs.find(l =>
                        l.id === deterministicId ||
                        (l.medicineId === med.id && l.date.startsWith(todayStr) && (l.status === 'taken' || l.status === 'missed') && l.expectedTime === t) ||
                        (l.medicineId === med.id && l.date.startsWith(todayStr) && l.status === 'taken' && !l.expectedTime) // Catch legacy taken logs
                    );

                    if (!takenOrMissedLog) {
                        try {
                            const [time, period] = t.split(' ');
                            let [hours, minutes] = time.split(':').map(Number);
                            if (period === 'PM' && hours !== 12) hours += 12;
                            if (period === 'AM' && hours === 12) hours = 0;
                            const doseTime = new Date();
                            doseTime.setHours(hours, minutes, 0, 0);

                            // If > 45 mins late
                            if (nowMs - doseTime.getTime() > 45 * 60 * 1000) {
                                const logRef = doc(db, 'Logs', deterministicId);
                                batch.set(logRef, {
                                    medicineId: med.id,
                                    date: new Date().toISOString(),
                                    status: 'missed',
                                    expectedTime: t
                                });
                                hasMissed = true;

                                // Notify Caregivers!
                                (async () => {
                                    try {
                                        const qConn = query(collection(db, 'Connections'), where('patientId', '==', user.uid), where('status', '==', 'approved'));
                                        const connSnap = await getDocs(qConn);
                                        const caregiverIds = connSnap.docs.map(d => d.data().caregiverId);

                                        if (caregiverIds.length > 0) {
                                            const qUsers = query(collection(db, 'Users'), where('__name__', 'in', caregiverIds));
                                            const usersSnap = await getDocs(qUsers);
                                            const pushTokens: string[] = [];
                                            usersSnap.forEach(u => {
                                                const d = u.data();
                                                if (d.expoPushToken) pushTokens.push(d.expoPushToken);
                                            });

                                            if (pushTokens.length > 0) {
                                                fetch('https://exp.host/--/api/v2/push/send', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(pushTokens.map(token => ({
                                                        to: token,
                                                        sound: 'default',
                                                        title: '⚠️ Missed Dose Alert',
                                                        body: `${useAuthStore.getState().profile?.name || 'Your patient'} missed their ${med.name} dose scheduled for ${t}.`,
                                                        data: { type: 'missed_dose', patientId: user.uid },
                                                    }))),
                                                }).catch(() => { });
                                            }
                                        }
                                    } catch (err) {
                                        console.error('[MissedDose] Failed to notify caregivers:', err);
                                    }
                                })();
                            }
                        } catch { }
                    }
                });
            });

            if (hasMissed) {
                await batch.commit();
            }
        });

        // Listen to incoming connections
        const qConn = query(collection(db, 'Connections'), where('patientId', '==', user.uid));
        onSnapshot(qConn, (snapshot) => {
            const cs: Connection[] = [];
            snapshot.forEach((doc) => cs.push({ id: doc.id, ...doc.data() } as Connection));
            set({ connections: cs });
        });
    },

    fetchCaregiverData: () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Listen to Connections
        const qConn = query(collection(db, 'Connections'), where('caregiverId', '==', user.uid));
        onSnapshot(qConn, async (snapshot) => {
            const cs: Connection[] = [];
            snapshot.forEach((doc) => cs.push({ id: doc.id, ...doc.data() } as Connection));
            set({ connections: cs });

            if (cs.length > 0) {
                const patientIds = cs.filter(c => c.status === 'approved').map(c => c.patientId);
                if (patientIds.length === 0) return;

                // Fetch patients info
                const qUsers = query(collection(db, 'Users'), where('role', '==', 'patient'));
                const usersSnap = await getDocs(qUsers);
                const ps: PatientUser[] = [];
                usersSnap.forEach(u => {
                    if (patientIds.includes(u.id)) {
                        ps.push(u.data() as PatientUser);
                    }
                });
                set({ patients: ps });

                // Fetch all their medicines and logs
                const qMeds = query(collection(db, 'Medicines'), where('patientId', 'in', patientIds));
                onSnapshot(qMeds, (s2) => {
                    const ms: Medicine[] = [];
                    s2.forEach((m) => ms.push({ id: m.id, ...m.data() } as Medicine));
                    set({ medicines: ms });
                });

                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const qLogs = query(collection(db, 'Logs'), where('date', '>=', startOfDay.toISOString()));
                onSnapshot(qLogs, async (s3) => {
                    const ls: MedLog[] = [];
                    s3.forEach(l => ls.push({ id: l.id, ...l.data() } as MedLog));
                    const meds = get().medicines;
                    const medsIds = meds.map(m => m.id);
                    const myLogs = ls.filter(l => medsIds.includes(l.medicineId));
                    set({ logs: myLogs });

                    // Detect Missed Doses (so caregivers running the app also trigger this logic for offline patients)
                    const nowMs = Date.now();
                    const todayStr = new Date().toISOString().split('T')[0];
                    const batch = writeBatch(db);
                    let hasMissed = false;

                    meds.forEach(med => {
                        med.times.forEach(t => {
                            const deterministicId = `${med.id}_${todayStr}_${t.replace(/[\s:]/g, '')}`;
                            const takenOrMissedLog = myLogs.find(l =>
                                l.id === deterministicId ||
                                (l.medicineId === med.id && l.date.startsWith(todayStr) && (l.status === 'taken' || l.status === 'missed') && l.expectedTime === t) ||
                                (l.medicineId === med.id && l.date.startsWith(todayStr) && l.status === 'taken' && !l.expectedTime)
                            );

                            if (!takenOrMissedLog) {
                                try {
                                    const [time, period] = t.split(' ');
                                    let [hours, minutes] = time.split(':').map(Number);
                                    if (period === 'PM' && hours !== 12) hours += 12;
                                    if (period === 'AM' && hours === 12) hours = 0;
                                    const doseTime = new Date();
                                    doseTime.setHours(hours, minutes, 0, 0);

                                    // If > 45 mins late
                                    if (nowMs - doseTime.getTime() > 45 * 60 * 1000) {
                                        const logRef = doc(db, 'Logs', deterministicId);
                                        batch.set(logRef, {
                                            medicineId: med.id,
                                            date: new Date().toISOString(),
                                            status: 'missed',
                                            expectedTime: t
                                        });
                                        hasMissed = true;

                                        // Real push notification for all caregivers of this patient
                                        (async () => {
                                            try {
                                                const qConn = query(collection(db, 'Connections'), where('patientId', '==', med.patientId), where('status', '==', 'approved'));
                                                const connSnap = await getDocs(qConn);
                                                const caregiverIds = connSnap.docs.map(d => d.data().caregiverId);

                                                if (caregiverIds.length > 0) {
                                                    const qUsers = query(collection(db, 'Users'), where('__name__', 'in', caregiverIds));
                                                    const usersSnap = await getDocs(qUsers);
                                                    const pushTokens: string[] = [];
                                                    usersSnap.forEach(u => {
                                                        const d = u.data();
                                                        if (d.expoPushToken) pushTokens.push(d.expoPushToken);
                                                    });

                                                    if (pushTokens.length > 0) {
                                                        fetch('https://exp.host/--/api/v2/push/send', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify(pushTokens.map(token => ({
                                                                to: token,
                                                                sound: 'default',
                                                                title: '⚠️ Missed Dose Alert',
                                                                body: `${ps.find(p => p.id === med.patientId)?.name || 'Your patient'} missed their ${med.name} dose scheduled for ${t}.`,
                                                                data: { type: 'missed_dose', patientId: med.patientId },
                                                            }))),
                                                        }).catch(() => { });
                                                    }
                                                }
                                            } catch (err) {
                                                console.error('[MissedDose] Failed to notify caregivers:', err);
                                            }
                                        })();

                                        // Keep local alert for app-usage feedback
                                        import('react-native').then(({ Alert }) => {
                                            const pName = ps.find(p => p.id === med.patientId)?.name || 'Your patient';
                                            Alert.alert(
                                                "⚠️ Missed Dose Alert",
                                                `${pName} missed their ${med.name} dose scheduled for ${t}.`
                                            );
                                        });
                                    }
                                } catch { }
                            }
                        });
                    });

                    if (hasMissed) {
                        await batch.commit();
                    }
                });
            }
        });
    },

    addMedicine: async (med) => {
        let notifIds: string[] = [];
        try {
            notifIds = await scheduleMedicineNotifications(med as Medicine);
        } catch (e: any) {
            console.warn('Failed to schedule local notification:', e);
            import('react-native').then(({ Alert }) => {
                Alert.alert("Notification Warning", "Medicine was saved, but we couldn't schedule a local notification. Please check app permissions.");
            });
        }
        const finalMed = { ...med, notificationIds: notifIds };
        await addDoc(collection(db, 'Medicines'), finalMed);
    },

    updateMedicine: async (id, med) => {
        const existing = get().medicines.find(m => m.id === id);
        if (existing?.notificationIds) {
            await cancelMedicineNotifications(existing.notificationIds);
        }

        const notifIds = await scheduleMedicineNotifications({ ...existing, ...med } as Medicine);
        await updateDoc(doc(db, 'Medicines', id), { ...med, notificationIds: notifIds });
    },

    deleteMedicine: async (id) => {
        const existing = get().medicines.find(m => m.id === id);
        if (existing?.notificationIds) {
            await cancelMedicineNotifications(existing.notificationIds);
        }
        await deleteDoc(doc(db, 'Medicines', id));
    },

    markTaken: async (medicineId, status, timeStr) => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (timeStr) {
            const deterministicId = `${medicineId}_${todayStr}_${timeStr.replace(/[\s:]/g, '')}`;
            await updateDoc(doc(db, 'Logs', deterministicId), {
                medicineId,
                date: new Date().toISOString(),
                status,
                expectedTime: timeStr
            }).catch(async (e) => {
                // If it doesn't exist to update, firmly set it (document creation)
                import('firebase/firestore').then(({ setDoc }) => {
                    setDoc(doc(db, 'Logs', deterministicId), {
                        medicineId,
                        date: new Date().toISOString(),
                        status,
                        expectedTime: timeStr
                    });
                });
            });
        } else {
            await addDoc(collection(db, 'Logs'), {
                medicineId,
                date: new Date().toISOString(),
                status
            });
        }
    },

    connectPatient: async (inviteCode) => {
        const qUsers = query(collection(db, 'Users'), where('inviteCode', '==', inviteCode));
        const qs = await getDocs(qUsers);
        if (!qs.empty) {
            const patientId = qs.docs[0].id;
            const user = useAuthStore.getState().user;
            if (user) {
                const connectionId = `${user.uid}_${patientId}`;
                await setDoc(doc(db, 'Connections', connectionId), {
                    patientId,
                    caregiverId: user.uid,
                    status: 'pending'
                });
            }
        } else {
            throw new Error("Invalid invite code");
        }
    },

    approveConnection: async (connectionId) => {
        await updateDoc(doc(db, 'Connections', connectionId), {
            status: 'approved'
        });
    }
}));
