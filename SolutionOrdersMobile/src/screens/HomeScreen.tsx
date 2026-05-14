import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AppLayout from '../components/AppLayout';
import type { ModuleName } from '../../App';

const API_URL = 'http://10.0.2.2:5000/api';

type Props = {
  onOpenModule: (moduleName: ModuleName) => void;
  onLogout: () => void;
};

const modules: { title: string; subtitle: string; name: ModuleName }[] = [
  { title: 'Rowery', subtitle: 'dodawanie, edycja i statusy rowerów', name: 'Rowery' },
  { title: 'Klienci', subtitle: 'dane klientów wypożyczalni', name: 'Klienci' },
  { title: 'Wypożyczenia', subtitle: 'aktywne i zakończone wypożyczenia', name: 'Wypożyczenia' },
  { title: 'Serwis', subtitle: 'naprawy i przeglądy rowerów', name: 'Serwis' },
  { title: 'Płatności', subtitle: 'rozliczenia za wypożyczenia', name: 'Płatności' },
  { title: 'Typy rowerów', subtitle: 'np. miejski, górski, elektryczny', name: 'Typy rowerów' },
  { title: 'Kategorie', subtitle: 'grupy i opis kategorii rowerów', name: 'Kategorie' },
  { title: 'Metody Płatności', subtitle: 'gotówka, karta, BLIK', name: 'Metody Płatności' },
];

export default function HomeScreen({ onOpenModule, onLogout }: Props) {
  const [dostepne, setDostepne] = useState(0);
  const [wypozyczone, setWypozyczone] = useState(0);
  const [serwis, setSerwis] = useState(0);
  const [klienci, setKlienci] = useState(0);

  const loadStats = async () => {
    try {
      const [roweryRes, klienciRes, serwisRes] = await Promise.all([
        fetch(`${API_URL}/Rowery`),
        fetch(`${API_URL}/Klienci`),
        fetch(`${API_URL}/Serwisy`),
      ]);

      const rowery = await roweryRes.json();
      const klienciData = await klienciRes.json();
      const serwisyData = await serwisRes.json();

      setDostepne(
        rowery.filter((r: any) => String(r.status).toLowerCase().includes('dostęp')).length
      );

      setWypozyczone(
        rowery.filter((r: any) => String(r.status).toLowerCase().includes('wypożycz')).length
      );

      setSerwis(
        rowery.filter((r: any) =>
        String(r.status).trim().toLowerCase() === 'serwis'
        ).length
      );
      setKlienci(klienciData.length);
    } catch {
      setDostepne(0);
      setWypozyczone(0);
      setSerwis(0);
      setKlienci(0);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AppLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dostepne}</Text>
            <Text style={styles.cardLabel}>Dostępne</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>{wypozyczone}</Text>
            <Text style={styles.cardLabel}>Wypożyczone</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>{serwis}</Text>
            <Text style={styles.cardLabel}>Serwis</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>{klienci}</Text>
            <Text style={styles.cardLabel}>Klienci</Text>
          </View>
        </View>

        <View style={styles.modulesList}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.name}
              style={styles.moduleCard}
              onPress={() => onOpenModule(module.name)}
            >
              <View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 22,
  },
  card: {
    width: '47.8%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5A24A',
    elevation: 3,
  },
  cardNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#E5A24A',
  },
  cardLabel: {
    fontSize: 14,
    marginTop: 8,
    color: '#CBD5E1',
  },
  modulesList: {
    gap: 12,
  },
  moduleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleTitle: {
    color: '#F9FAFB',
    fontWeight: '800',
    fontSize: 17,
  },
  moduleSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 5,
  },
  arrow: {
    color: '#E5A24A',
    fontSize: 32,
    fontWeight: '300',
  },
  logoutButton: {
    marginTop: 22,
    marginBottom: 26,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  logoutText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 15,
  },
});