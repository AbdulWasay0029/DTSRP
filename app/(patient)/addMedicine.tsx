import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Minus, Pill, Syringe, Clock, Trash2, Utensils, CalendarDays, BellPlus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../libs/store';
import { useMedicineStore } from '../../libs/medicineStore';

export default function AddMedicineScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { addMedicine } = useMedicineStore();

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState(500);
    const [type, setType] = useState('Tablet');
    const [frequency, setFrequency] = useState('Once');

    // Dates & Times
    const [times, setTimes] = useState<Date[]>(() => {
        const d = new Date();
        d.setHours(8, 0, 0, 0);
        return [d];
    });
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
    });
    const [mealRelation, setMealRelation] = useState('After');
    const [reminders, setReminders] = useState(true);

    // Android Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<{ type: 'time' | 'start' | 'end', index?: number } | null>(null);

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) return alert('Please enter a medicine name');
            setStep(2);
        } else if (step === 2) {
            if (times.length === 0) return alert('Please add at least one reminder time');
            setStep(3);
        } else if (step === 3) {
            handleSave();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const formatTimeStr = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDateStr = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const handleSave = async () => {
        if (!user) return;

        await addMedicine({
            patientId: user.uid,
            name,
            dosage: `${dosage}mg`,
            frequency,
            times: times.map(formatTimeStr),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            mealRelation,
            reminderEnabled: reminders
        });
        router.back();
    };

    const addTime = () => {
        const newTime = new Date();
        newTime.setHours(times.length % 2 === 0 ? 8 : 20, 0, 0, 0);
        setTimes([...times, newTime]);
    };

    const removeTime = (index: number) => setTimes(times.filter((_, i) => i !== index));

    const handleAndroidPicker = (event: any, date?: Date) => {
        setShowPicker(false);
        if (event.type === 'set' && date && pickerTarget) {
            if (pickerTarget.type === 'time' && pickerTarget.index !== undefined) {
                const newTimes = [...times];
                newTimes[pickerTarget.index] = date;
                setTimes(newTimes);
            } else if (pickerTarget.type === 'start') {
                setStartDate(date);
                if (endDate < date) {
                    const nextEnd = new Date(date);
                    nextEnd.setDate(nextEnd.getDate() + 30);
                    setEndDate(nextEnd);
                }
            } else if (pickerTarget.type === 'end') {
                setEndDate(date);
            }
        }
    };

    const openAndroidPicker = (type: 'time' | 'start' | 'end', index?: number) => {
        if (Platform.OS === 'android') {
            setPickerTarget({ type, index });
            setShowPicker(true);
        }
    };

    const handleIOSPicker = (date: Date, type: 'time' | 'start' | 'end', index?: number) => {
        if (type === 'time' && index !== undefined) {
            const newTimes = [...times];
            newTimes[index] = date;
            setTimes(newTimes);
        } else if (type === 'start') {
            setStartDate(date);
            if (endDate < date) {
                const nextEnd = new Date(date);
                nextEnd.setDate(nextEnd.getDate() + 30);
                setEndDate(nextEnd);
            }
        } else if (type === 'end') {
            setEndDate(date);
        }
    };

    const renderStepIndicators = () => (
        <View style={styles.stepContainer}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Medicine</Text>
                    <View style={{ width: 40 }} />
                </View>

                {renderStepIndicators()}

                <ScrollView contentContainerStyle={styles.scrollForm} showsVerticalScrollIndicator={false}>

                    {step === 1 && (
                        <View style={styles.stepBlock}>
                            <View style={styles.section}>
                                <Text style={styles.label}>Medicine Name</Text>
                                <View style={styles.inputCard}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="e.g. Paracetamol"
                                        placeholderTextColor="#cbd5e1"
                                        value={name}
                                        onChangeText={setName}
                                        autoFocus
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Dosage</Text>
                                <View style={styles.dosageCard}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => setDosage(Math.max(0, dosage - 50))}>
                                        <Minus size={24} color="#19e66f" />
                                    </TouchableOpacity>
                                    <View style={styles.dosageCenter}>
                                        <Text style={styles.dosageValue}>{dosage}</Text>
                                        <Text style={styles.dosageUnit}>mg</Text>
                                    </View>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => setDosage(dosage + 50)}>
                                        <Plus size={24} color="#19e66f" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Medicine Type</Text>
                                <View style={styles.typeGrid}>
                                    {['Tablet', 'Syrup', 'Capsule'].map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                                            onPress={() => setType(t)}
                                        >
                                            {t === 'Tablet' && <Pill size={28} color={type === t ? '#19e66f' : '#94a3b8'} />}
                                            {t === 'Syrup' && <Syringe size={28} color={type === t ? '#19e66f' : '#94a3b8'} />}
                                            {t === 'Capsule' && <Pill size={28} color={type === t ? '#19e66f' : '#94a3b8'} />}
                                            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepBlock}>
                            <View style={styles.section}>
                                <Text style={styles.label}>Frequency</Text>
                                <View style={styles.freqRow}>
                                    {['Once', 'Twice', 'Custom'].map(f => (
                                        <TouchableOpacity
                                            key={f}
                                            style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                                            onPress={() => setFrequency(f)}
                                        >
                                            <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.label}>Set Time</Text>
                                    <TouchableOpacity onPress={addTime} style={styles.addTimeBtn}>
                                        <Plus size={16} color="#19e66f" />
                                        <Text style={styles.addTimeText}>Add Time</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ gap: 12 }}>
                                    {times.map((t, index) => (
                                        <View key={index} style={styles.timeCard}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                                <View style={styles.timeIconWrap}>
                                                    <Clock size={20} color="#19e66f" />
                                                </View>
                                                {Platform.OS === 'ios' ? (
                                                    <DateTimePicker
                                                        value={t}
                                                        mode="time"
                                                        display="default"
                                                        onChange={(e, d) => d && handleIOSPicker(d, 'time', index)}
                                                    />
                                                ) : (
                                                    <TouchableOpacity onPress={() => openAndroidPicker('time', index)}>
                                                        <Text style={styles.timeText}>{formatTimeStr(t)}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={() => removeTime(index)} hitSlop={10}>
                                                <Trash2 size={20} color="#f87171" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepBlock}>
                            <View style={styles.section}>
                                <Text style={styles.label}>Meal Relation</Text>
                                <View style={styles.typeGrid}>
                                    {['Before', 'After', 'Anytime'].map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.typeBtn, mealRelation === m && styles.typeBtnActive]}
                                            onPress={() => setMealRelation(m)}
                                        >
                                            <Utensils size={28} color={mealRelation === m ? '#19e66f' : '#94a3b8'} />
                                            <Text style={[styles.typeText, mealRelation === m && styles.typeTextActive]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.datesRow}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.label}>Start Date</Text>
                                    <View style={styles.dateInput}>
                                        {Platform.OS === 'ios' ? (
                                            <DateTimePicker
                                                value={startDate}
                                                mode="date"
                                                display="default"
                                                onChange={(e, d) => d && handleIOSPicker(d, 'start')}
                                            />
                                        ) : (
                                            <TouchableOpacity onPress={() => openAndroidPicker('start')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                                <Text style={styles.dateText}>{formatDateStr(startDate)}</Text>
                                                <CalendarDays size={18} color="#94a3b8" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.dateBox}>
                                    <Text style={styles.label}>End Date</Text>
                                    <View style={styles.dateInput}>
                                        {Platform.OS === 'ios' ? (
                                            <DateTimePicker
                                                value={endDate}
                                                mode="date"
                                                display="default"
                                                minimumDate={startDate}
                                                onChange={(e, d) => d && handleIOSPicker(d, 'end')}
                                            />
                                        ) : (
                                            <TouchableOpacity onPress={() => openAndroidPicker('end')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                                                <Text style={styles.dateText}>{formatDateStr(endDate)}</Text>
                                                <CalendarDays size={18} color="#94a3b8" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.reminderCard}
                                activeOpacity={0.8}
                                onPress={() => setReminders(!reminders)}
                            >
                                <View style={styles.reminderLeft}>
                                    <View style={styles.bellIconWrap}>
                                        <BellPlus size={24} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text style={styles.reminderTitle}>Reminders</Text>
                                        <Text style={styles.reminderSub}>Notify for every dose</Text>
                                    </View>
                                </View>
                                <View style={[styles.toggleWrap, reminders && styles.toggleWrapActive]}>
                                    <View style={[styles.toggleKnob, reminders && styles.toggleKnobActive]} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                        <Text style={styles.primaryBtnText}>{step === 3 ? 'Save Medicine' : 'Next Step'}</Text>
                    </TouchableOpacity>
                </View>

                {showPicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={
                            pickerTarget?.type === 'time' ? times[pickerTarget.index ?? 0] :
                                pickerTarget?.type === 'start' ? startDate : endDate
                        }
                        mode={pickerTarget?.type === 'time' ? 'time' : 'date'}
                        display="default"
                        onChange={handleAndroidPicker}
                        minimumDate={pickerTarget?.type === 'end' ? startDate : undefined}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f6f8f7' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    },
    backBtn: {
        width: 44, height: 44, backgroundColor: '#fff',
        borderRadius: 22, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },

    stepContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 16 },
    stepDot: { width: 40, height: 6, borderRadius: 3, backgroundColor: '#e2e8f0' },
    stepDotActive: { backgroundColor: '#19e66f' },

    scrollForm: { paddingHorizontal: 20, paddingBottom: 120 },
    stepBlock: { paddingTop: 16 },
    section: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

    inputCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
    },
    textInput: { fontSize: 20, fontWeight: '600', color: '#0f172a', padding: 0 },

    dosageCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
    },
    iconBtn: { width: 56, height: 56, backgroundColor: '#f8fafc', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    dosageCenter: { alignItems: 'center', flexDirection: 'row' },
    dosageValue: { fontSize: 36, fontWeight: '700', color: '#0f172a' },
    dosageUnit: { fontSize: 18, fontWeight: '600', color: '#94a3b8', marginLeft: 6, marginTop: 8 },

    typeGrid: {
        flexDirection: 'row', gap: 8, backgroundColor: '#fff', padding: 8, borderRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
        flexWrap: 'wrap', justifyContent: 'center'
    },
    typeBtn: { flex: 1, minWidth: 100, alignItems: 'center', paddingVertical: 16, borderRadius: 20, backgroundColor: '#f8fafc', gap: 8, borderWidth: 2, borderColor: 'transparent' },
    typeBtnActive: { backgroundColor: 'rgba(25, 230, 111, 0.1)', borderColor: '#19e66f' },
    typeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#0f172a' },

    freqRow: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 8, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
    },
    freqBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
    freqBtnActive: { backgroundColor: '#19e66f' },
    freqText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    freqTextActive: { color: '#ffffff' },

    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    addTimeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addTimeText: { fontSize: 14, fontWeight: '700', color: '#19e66f' },
    timeCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
    },
    timeIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(25, 230, 111, 0.1)', alignItems: 'center', justifyContent: 'center' },
    timeText: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
    timeAmPm: { fontSize: 16, fontWeight: '500', color: '#64748b' },

    datesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    dateBox: { flex: 1 },
    dateInput: {
        backgroundColor: '#fff', borderRadius: 20, padding: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
        height: 60
    },
    dateText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },

    reminderCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4
    },
    reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    bellIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    reminderTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    reminderSub: { fontSize: 13, color: '#64748b', marginTop: 2 },

    toggleWrap: { width: 56, height: 32, backgroundColor: '#e2e8f0', borderRadius: 16, padding: 4, justifyContent: 'center' },
    toggleWrapActive: { backgroundColor: '#19e66f' },
    toggleKnob: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    toggleKnobActive: { transform: [{ translateX: 24 }] },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(246, 248, 247, 0.95)', padding: 20, paddingBottom: 32,
        borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)'
    },
    primaryBtn: {
        backgroundColor: '#19e66f', width: '100%', paddingVertical: 20, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: 'rgba(25, 230, 111, 0.4)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 8
    },
    primaryBtnText: { fontSize: 20, fontWeight: '700', color: '#0f172a' }
});
