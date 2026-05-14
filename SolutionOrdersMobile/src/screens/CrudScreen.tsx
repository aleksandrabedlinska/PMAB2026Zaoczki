import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';

type Props = {
  moduleName: string;
  onBack: () => void;
};

type Field = {
  key: string;
  label: string;
};

type CrudItem = {
  id: number;
  [key: string]: any;
};

type Klient = {
  id: number;
  imie: string;
  nazwisko: string;
  telefon: string;
};

type Rower = {
  id: number;
  nazwa: string;
  typ: string;
  cena: number;
  status: string;
};

type WybranyRower = {
  id: number;
  nazwa: string;
  cena: number;
};

const API_URL = 'http://10.0.2.2:5000/api';

const apiByModule: Record<string, string> = {
  Rowery: 'Rowery',
  Klienci: 'Klienci',
  Wypożyczenia: 'Wypozyczenia',
  Serwis: 'Serwisy',
  Płatności: 'Platnosci',
  'Typy rowerów': 'TypyRowerow',
  Kategorie: 'Kategorie',
  'Metody Płatności': 'MetodyPlatnosci',
};

const fieldsByModule: Record<string, Field[]> = {
  Rowery: [
    { key: 'nazwa', label: 'Nazwa roweru' },
    { key: 'typ', label: 'Typ roweru' },
    { key: 'cena', label: 'Cena za godzinę' },
    { key: 'status', label: 'Status' },
  ],
  Klienci: [
    { key: 'imie', label: 'Imię' },
    { key: 'nazwisko', label: 'Nazwisko' },
    { key: 'telefon', label: 'Telefon' },
  ],
  Wypożyczenia: [{ key: 'status', label: 'Status' }],
  Serwis: [
    { key: 'opisUsterki', label: 'Opis usterki' },
    { key: 'status', label: 'Status' },
  ],
  Płatności: [
    { key: 'klient', label: 'Klient' },
    { key: 'kwota', label: 'Kwota' },
    { key: 'metoda', label: 'Metoda płatności' },
    { key: 'status', label: 'Status' },
  ],
  'Typy rowerów': [
    { key: 'nazwa', label: 'Nazwa typu' },
    { key: 'opis', label: 'Opis' },
  ],
  Kategorie: [
    { key: 'nazwa', label: 'Nazwa kategorii' },
    { key: 'opis', label: 'Opis kategorii' },
  ],
  'Metody Płatności': [
    { key: 'nazwa', label: 'Nazwa metody' },
    { key: 'opis', label: 'Opis' },
    { key: 'aktywna', label: 'Aktywna' },
  ],
};

export default function CrudScreen({ moduleName, onBack }: Props) {
  const fields = fieldsByModule[moduleName] || [];
  const endpoint = apiByModule[moduleName];

  const emptyForm = fields.reduce((acc, field) => {
    acc[field.key] = '';
    return acc;
  }, {} as Record<string, string>);

  const [items, setItems] = useState<CrudItem[]>([]);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [klienci, setKlienci] = useState<Klient[]>([]);
  const [rowery, setRowery] = useState<Rower[]>([]);

  const [klientSearch, setKlientSearch] = useState('');
  const [rowerSearch, setRowerSearch] = useState('');
  const [selectedKlientId, setSelectedKlientId] = useState<number | null>(null);
  const [selectedRowerId, setSelectedRowerId] = useState<number | null>(null);
  const [selectedRowerCena, setSelectedRowerCena] = useState<number>(0);
  const [wybraneRowery, setWybraneRowery] = useState<WybranyRower[]>([]);

  const loadItems = async () => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      const data = await response.json();
      setItems(data);
    } catch {
      Alert.alert('Błąd', 'Nie udało się pobrać danych z API.');
    }
  };

  const loadRelationsData = async () => {
    if (moduleName !== 'Wypożyczenia' && moduleName !== 'Serwis') return;

    try {
      const roweryResponse = await fetch(`${API_URL}/Rowery`);
      const roweryData = await roweryResponse.json();
      setRowery(roweryData);

      if (moduleName === 'Wypożyczenia') {
        const klienciResponse = await fetch(`${API_URL}/Klienci`);
        const klienciData = await klienciResponse.json();
        setKlienci(klienciData);
      }
    } catch {
      Alert.alert('Błąd', 'Nie udało się pobrać danych powiązanych.');
    }
  };

  useEffect(() => {
    setForm(emptyForm);
    setEditingId(null);
    setKlientSearch('');
    setRowerSearch('');
    setSelectedKlientId(null);
    setSelectedRowerId(null);
    setSelectedRowerCena(0);
    setWybraneRowery([]);

    loadItems();
    loadRelationsData();
  }, [moduleName]);

  const updateField = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const filteredKlienci = klienci.filter((klient) =>
    `${klient.imie} ${klient.nazwisko}`
      .toLowerCase()
      .includes(klientSearch.toLowerCase())
  );

  const filteredRowery = rowery.filter((rower) => {
    const pasujeDoTekstu = rower.nazwa
      .toLowerCase()
      .includes(rowerSearch.toLowerCase());

    const nieJestWybrany = !wybraneRowery.some((r) => r.id === rower.id);

    if (moduleName === 'Wypożyczenia') {
      const jestDostepny =
        String(rower.status).trim().toLowerCase() === 'dostępny';

      return pasujeDoTekstu && nieJestWybrany && jestDostepny;
    }

    return pasujeDoTekstu;
  });

  const prepareBody = () => {
    if (moduleName === 'Wypożyczenia') {
      if (!selectedKlientId || wybraneRowery.length === 0) {
        throw new Error('Wybierz klienta i minimum jeden rower.');
      }

      return {
        klientId: selectedKlientId,
        dataWypozyczenia: new Date().toISOString(),
        dataZwrotu: null,
        status: form.status || 'Aktywne',
        pozycjeWypozyczenia: wybraneRowery.map((rower) => ({
          rowerId: rower.id,
          cenaZaGodzine: rower.cena,
        })),
      };
    }

    if (moduleName === 'Serwis') {
      if (!selectedRowerId) {
        throw new Error('Wybierz rower.');
      }

      return {
        rowerId: selectedRowerId,
        opisUsterki: form.opisUsterki,
        status: form.status || 'Aktywne',
      };
    }

    const body: Record<string, string | number | boolean | null> = {};

    fields.forEach((field) => {
      const value = form[field.key];

      if (field.key === 'cena' || field.key === 'kwota') {
        body[field.key] = Number(value);
      } else if (field.key === 'aktywna') {
        body[field.key] =
          value.toLowerCase() === 'true' ||
          value === '1' ||
          value.toLowerCase() === 'tak';
      } else {
        body[field.key] = value;
      }
    });

    return body;
  };

  const saveItem = async () => {
    const hasValue =
      moduleName === 'Wypożyczenia'
        ? selectedKlientId !== null && wybraneRowery.length > 0
        : moduleName === 'Serwis'
        ? selectedRowerId !== null && form.opisUsterki?.trim() !== ''
        : Object.values(form).some((value) => value.trim() !== '');

    if (!hasValue) {
      Alert.alert('Uwaga', 'Uzupełnij dane formularza.');
      return;
    }

    try {
      const method = editingId !== null ? 'PUT' : 'POST';
      const url =
        editingId !== null
          ? `${API_URL}/${endpoint}/${editingId}`
          : `${API_URL}/${endpoint}`;

      const body: any = prepareBody();

      if (editingId !== null) {
        body.id = editingId;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        Alert.alert('Błąd', 'Nie udało się zapisać danych.');
        return;
      }

      cancelEdit();
      loadItems();
      loadRelationsData();
    } catch (error) {
      Alert.alert(
        'Błąd',
        error instanceof Error ? error.message : 'Brak połączenia z API.'
      );
    }
  };

  const editItem = (item: CrudItem) => {
    if (moduleName === 'Wypożyczenia') {
      const klient = item.klient;
      const pozycje = item.pozycjeWypozyczenia || [];

      setSelectedKlientId(item.klientId ?? klient?.id ?? null);
      setKlientSearch(klient ? `${klient.imie} ${klient.nazwisko}` : '');

      setWybraneRowery(
        pozycje.map((p: any) => ({
          id: p.rowerId ?? p.rower?.id,
          nazwa: p.rower?.nazwa ?? `Rower ${p.rowerId}`,
          cena: p.cenaZaGodzine ?? p.rower?.cena ?? 0,
        }))
      );

      setRowerSearch('');
      setSelectedRowerId(null);
      setSelectedRowerCena(0);
      setForm({ status: String(item.status ?? '') });
      setEditingId(Number(item.id));
      return;
    }

    if (moduleName === 'Serwis') {
      setSelectedRowerId(item.rowerId ?? item.rower?.id ?? null);
      setSelectedRowerCena(item.rower?.cena ?? 0);
      setRowerSearch(item.rower?.nazwa ?? '');
      setForm({
        opisUsterki: String(item.opisUsterki ?? ''),
        status: String(item.status ?? ''),
      });
      setEditingId(Number(item.id));
      return;
    }

    const newForm: Record<string, string> = {};
    fields.forEach((field) => {
      newForm[field.key] = String(item[field.key] ?? '');
    });

    setForm(newForm);
    setEditingId(Number(item.id));
  };

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        Alert.alert('Błąd', 'Nie udało się usunąć elementu.');
        return;
      }

      loadItems();
      loadRelationsData();
    } catch {
      Alert.alert('Błąd', 'Brak połączenia z API.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setKlientSearch('');
    setRowerSearch('');
    setSelectedKlientId(null);
    setSelectedRowerId(null);
    setSelectedRowerCena(0);
    setWybraneRowery([]);
  };

  const renderRowerSearch = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Rower</Text>
      <TextInput
        value={rowerSearch}
        onChangeText={(value) => {
          setRowerSearch(value);
          setSelectedRowerId(null);
          setSelectedRowerCena(0);
        }}
        placeholder="Wpisz nazwę roweru"
        placeholderTextColor="#64748B"
        style={styles.input}
      />

      {rowerSearch.length > 0 &&
        (moduleName === 'Wypożyczenia' || selectedRowerId === null) && (
          <View style={styles.suggestionBox}>
            {filteredRowery.slice(0, 5).map((rower) => (
              <TouchableOpacity
                key={rower.id}
                style={styles.suggestionItem}
                onPress={() => {
                  if (moduleName === 'Wypożyczenia') {
                    setWybraneRowery([
                      ...wybraneRowery,
                      {
                        id: rower.id,
                        nazwa: rower.nazwa,
                        cena: rower.cena,
                      },
                    ]);
                    setRowerSearch('');
                    return;
                  }

                  setSelectedRowerId(rower.id);
                  setSelectedRowerCena(rower.cena);
                  setRowerSearch(rower.nazwa);
                }}
              >
                <Text style={styles.suggestionText}>{rower.nazwa}</Text>
                <Text style={styles.suggestionSubText}>
                  {rower.typ} • {rower.cena} zł/h • {rower.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
    </View>
  );

  const renderRentalForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Klient</Text>
        <TextInput
          value={klientSearch}
          onChangeText={(value) => {
            setKlientSearch(value);
            setSelectedKlientId(null);
          }}
          placeholder="Wpisz imię lub nazwisko klienta"
          placeholderTextColor="#64748B"
          style={styles.input}
        />

        {klientSearch.length > 0 && selectedKlientId === null && (
          <View style={styles.suggestionBox}>
            {filteredKlienci.slice(0, 5).map((klient) => (
              <TouchableOpacity
                key={klient.id}
                style={styles.suggestionItem}
                onPress={() => {
                  setSelectedKlientId(klient.id);
                  setKlientSearch(`${klient.imie} ${klient.nazwisko}`);
                }}
              >
                <Text style={styles.suggestionText}>
                  {klient.imie} {klient.nazwisko}
                </Text>
                <Text style={styles.suggestionSubText}>{klient.telefon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {renderRowerSearch()}

      {wybraneRowery.length > 0 && (
        <View style={styles.selectedBox}>
          <Text style={styles.label}>Wybrane rowery</Text>

          {wybraneRowery.map((rower) => (
            <View key={rower.id} style={styles.selectedItem}>
              <Text style={styles.selectedText}>
                {rower.nazwa} • {rower.cena} zł/h
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setWybraneRowery(wybraneRowery.filter((r) => r.id !== rower.id))
                }
              >
                <Text style={styles.removeText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {['Aktywne', 'Zakończone', 'Anulowane'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              form.status === status && styles.statusButtonActive,
            ]}
            onPress={() => updateField('status', status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                form.status === status && styles.statusButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

    const renderServiceForm = () => (
    <>
      {renderRowerSearch()}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Opis usterki</Text>
        <TextInput
          value={form.opisUsterki}
          onChangeText={(value) => updateField('opisUsterki', value)}
          placeholder="Np. przebita opona"
          placeholderTextColor="#64748B"
          style={styles.input}
        />
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {['Aktywne', 'W trakcie', 'Zakończone'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              form.status === status && styles.statusButtonActive,
            ]}
            onPress={() => updateField('status', status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                form.status === status && styles.statusButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderItemContent = (item: CrudItem) => {
    if (moduleName === 'Wypożyczenia') {
      const roweryText =
        item.pozycjeWypozyczenia
          ?.map((p: any) => p.rower?.nazwa)
          .filter(Boolean)
          .join(', ') || '-';

      return (
        <>
          <Text style={styles.itemMainText}>
            Klient: {item.klient?.imie ?? '-'} {item.klient?.nazwisko ?? ''}
          </Text>
          <Text style={styles.itemText}>Rowery: {roweryText}</Text>
          <Text style={styles.itemText}>Status: {String(item.status ?? '-')}</Text>
          <Text style={styles.itemText}>
            Data: {String(item.dataWypozyczenia ?? '-').slice(0, 10)}
          </Text>
        </>
      );
    }

    if (moduleName === 'Serwis') {
      return (
        <>
          <Text style={styles.itemMainText}>
            Rower: {item.rower?.nazwa ?? '-'}
          </Text>
          <Text style={styles.itemText}>
            Opis usterki: {String(item.opisUsterki ?? '-')}
          </Text>
          <Text style={styles.itemText}>Status: {String(item.status ?? '-')}</Text>
        </>
      );
    }

    return fields.map((field, index) => (
      <Text
        key={field.key}
        style={index === 0 ? styles.itemMainText : styles.itemText}
      >
        {field.label}: {String(item[field.key] ?? '-')}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Wróć</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{moduleName}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edytuj element' : 'Dodaj nowy element'}
          </Text>

          {moduleName === 'Wypożyczenia'
            ? renderRentalForm()
            : moduleName === 'Serwis'
            ? renderServiceForm()
            : fields.map((field) => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    value={form[field.key]}
                    onChangeText={(value) => updateField(field.key, value)}
                    placeholder={field.label}
                    placeholderTextColor="#64748B"
                    style={styles.input}
                  />
                </View>
              ))}

          <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
            <Text style={styles.saveButtonText}>
              {editingId ? 'Zapisz zmiany' : 'Dodaj'}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelText}>Anuluj edycję</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.listTitle}>Lista</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak elementów do wyświetlenia</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              {renderItemContent(item)}

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => editItem(item)}>
                  <Text style={styles.edit}>Edytuj</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteItem(Number(item.id))}>
                  <Text style={styles.delete}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  back: { color: '#E5A24A', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  title: { color: '#F9FAFB', fontSize: 30, fontWeight: 'bold', marginBottom: 18 },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 22,
  },
  formTitle: { color: '#F9FAFB', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  inputGroup: { marginBottom: 12 },
  label: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 14,
    color: '#F9FAFB',
    fontSize: 15,
  },
  suggestionBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  suggestionText: {
    color: '#F9FAFB',
    fontWeight: '700',
  },
  suggestionSubText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },
  selectedBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    marginBottom: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  selectedText: {
    color: '#F9FAFB',
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  removeText: {
    color: '#F87171',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  statusButtonActive: {
    backgroundColor: '#E5A24A',
    borderColor: '#E5A24A',
  },
  statusButtonText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
  },
  statusButtonTextActive: {
    color: '#0F172A',
  },
  saveButton: {
    backgroundColor: '#E5A24A',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  cancelButton: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontWeight: '600' },
  listTitle: { color: '#F9FAFB', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  list: { gap: 12, paddingBottom: 30 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 20 },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemMainText: { color: '#F9FAFB', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  itemText: { color: '#CBD5E1', fontSize: 14, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 12 },
  edit: { color: '#E5A24A', fontWeight: '700' },
  delete: { color: '#F87171', fontWeight: '700' },
});