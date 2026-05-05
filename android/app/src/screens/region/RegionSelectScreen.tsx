import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { storage } from '../../utils/storage';
import { COLORS } from '../../constants/theme';

const RAW = "세종특별시:12부산광역시:21대구광역시:22인천광역시:23광주광역시:24대전광역시/계룡시:25울산광역시:26제주도:39수원시:31010성남시:31020의정부시:31030안양시:31040부천시:31050광명시:31060평택시:31070동두천시:31080안산시:31090고양시:31100과천시:31110구리시:31120남양주시:31130오산시:31140시흥시:31150군포시:31160의왕시:31170하남시:31180용인시:31190파주시:31200이천시:31210안성시:31220김포시:31230화성시:31240광주시:31250양주시:31260포천시:31270여주시:31320연천군:31350가평군:31370양평군:31380춘천시:32010원주시/횡성군:32020태백시:32050홍천군:32310철원군:32360양양군:32410청주시:33010충주시:33020제천시:33030보은군:33320옥천군:33330영동군:33340진천군:33350괴산군:33360음성군:33370단양군:33380천안시:34010공주시:34020아산시:34040서산시:34050논산시:34060계룡시:34070부여군:34330당진시:34390전주시:35010군산시:35020익산시:35030정읍시:35040남원시:35050김제시:35060진안군:35320무주군:35330장수군:35340임실군:35350순창군:35360고창군:35370부안군:35380목포시:36010여수시:36020순천시:36030나주시:36040광양시:36060곡성군:36320구례군:36330고흥군:36350장흥군:36380해남군:36400영암군:36410무안군:36420함평군:36430장성군:36450완도군:36460진도군:36470신안군:36480포항시:37010경주시:37020김천시:37030안동시:37040구미시:37050영주시:37060영천시:37070상주시:37080문경시:37090경산시:37100의성군:37320청송군:37330영양군:37340영덕군:37350청도군:37360고령군:37370성주군:37380칠곡군:37390예천군:37400봉화군:37410울진군:37420울릉군:37430창원시:38010진주시:38030통영시:38050사천시:38060김해시:38070밀양시:38080거제시:38090양산시:38100의령군:38310함안군:38320창녕군:38330고성군:38340남해군:38350하동군:38360산청군:38370함양군:38380거창군:38390합천군:38400";

const PROVINCE_MAP: Record<string, string> = {
  '31': '경기','12': '세종', '21': '부산', '22': '대구', '23': '인천', '24': '광주',
  '25': '대전', '26': '울산',  '32': '강원', '33': '충북',
  '34': '충남', '35': '전북', '36': '전남', '37': '경북', '38': '경남', '39': '제주',
};

interface CityItem { name: string; code: string; }
type RegionData = Record<string, CityItem[]>;

function parseRegionData(): RegionData {
  const entries = RAW.match(/[^:]+:\d+/g) || [];
  const result: RegionData = {};
  entries.forEach(e => {
    const lastColon = e.lastIndexOf(':');
    const name = e.substring(0, lastColon);
    const code = e.substring(lastColon + 1);
    const provCode = code.length <= 2 ? code : code.substring(0, 2);
    const provName = PROVINCE_MAP[provCode] || provCode;
    if (!result[provName]) result[provName] = [];
    result[provName].push({ name, code });
  });
  return result;
}

interface RegionSelectProps {
  onComplete: () => void;
}

const RegionSelectScreen = ({ onComplete }: RegionSelectProps) => {
  const regionData = useMemo(() => parseRegionData(), []);
  const provinces = useMemo(() => {
    const keys = Object.keys(regionData);
    // 광역시 및 특별시 목록 (그룹화 기준)
    const majorCities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];

    // 1. 광역시/특별시 그룹 추출 및 정렬
    const cityGroup = keys
      .filter(name => majorCities.includes(name))
      .sort((a, b) => a.localeCompare(b, 'ko'));
    
    // 2. 나머지 '도' 그룹 추출 및 정렬
    const provinceGroup = keys
      .filter(name => !majorCities.includes(name))
      .sort((a, b) => a.localeCompare(b, 'ko'));

    return [...cityGroup, ...provinceGroup];
  }, [regionData]);

  const [selectedProv, setSelectedProv] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);

  const handleProvSelect = (prov: string) => {
    setSelectedProv(prov);
    setSelectedCity(null);
  };

  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city);
  };

  const handleConfirm = async () => {
    if (!selectedCity) return;
    await storage.setCity(selectedCity.name);
    await storage.setCityCode(selectedCity.code);
    Alert.alert('설정 완료', `${selectedCity.name}으로 설정되었습니다!`, [
      { text: '확인', onPress: onComplete }
    ]);
  };

  const cities = selectedProv ? regionData[selectedProv] : [];

  const hintText = selectedCity
    ? `${selectedCity.name} (${selectedProv})`
    : selectedProv
    ? `${selectedProv}의 시/군을 선택해주세요`
    : '시/도를 먼저 선택해주세요';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>설정에서 언제든지 변경할 수 있어요</Text>
        <Text style={styles.title}>이용할 지역을 선택해주세요</Text>
      </View>

      <View style={styles.selectionContainer}>
        {/* 좌측: 시/도 리스트 */}
        <View style={styles.provinceColumn}>
          <FlatList
            data={provinces}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.provinceItem, selectedProv === item && styles.provinceItemActive]}
                onPress={() => handleProvSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.provinceText, selectedProv === item && styles.provinceTextActive]}>
                  {item}
                </Text>
                {selectedProv === item && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 우측: 시/군/구 리스트 */}
        <View style={styles.cityColumn}>
          <FlatList
            data={cities}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.cityListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedProv ? '도시 정보가 없어요' : '좌측에서 시/도를\n먼저 선택해주세요'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isActive = selectedCity?.code === item.code;
              return (
                <TouchableOpacity
                  style={[styles.cityRow, isActive && styles.cityRowActive]}
                  onPress={() => handleCitySelect(item)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.cityName, isActive && styles.cityNameActive]}>
                    {item.name}
                  </Text>
                  {isActive && <Text style={styles.cityCheck}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* 하단 힌트 + 확인 버튼 */}
      <View style={styles.footer}>
        <View style={styles.hintBox}>
          <View style={[styles.hintDot, selectedCity && styles.hintDotActive]} />
          <Text style={[styles.hintText, selectedCity && styles.hintTextActive]}>
            {hintText}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedCity && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedCity}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  subtitle: { fontSize: 13, color: COLORS.text.hint, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '600', color: COLORS.text.main },

  selectionContainer: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  provinceColumn: {
    width: '35%',
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  provinceItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    position: 'relative',
  },
  provinceItemActive: {
    backgroundColor: COLORS.text.white,
  },
  provinceText: { fontSize: 15, color: COLORS.text.sub, textAlign: 'center' },
  provinceTextActive: { color: COLORS.text.main, fontWeight: 'bold' },
  activeIndicator: {
    position: 'absolute',
    left: 0, top: 15, bottom: 15,
    width: 4, backgroundColor: COLORS.primary,
    borderTopRightRadius: 4, borderBottomRightRadius: 4,
  },

  cityColumn: { flex: 1, backgroundColor: COLORS.text.white },
  cityListContent: { paddingVertical: 8 },
  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 24,
  },
  cityRowActive: {
    backgroundColor: COLORS.primaryLight,
  },
  cityName: { flex: 1, fontSize: 15, color: COLORS.text.main },
  cityNameActive: { color: COLORS.primaryDark, fontWeight: '600' },
  cityCheck: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold' },

  emptyContainer: { paddingTop: 100, alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', lineHeight: 20 },

  footer: { padding: 20, paddingBottom: 8, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.text.white },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  hintDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D6DB' },
  hintDotActive: { backgroundColor: COLORS.primary },
  hintText: { fontSize: 13, color: COLORS.text.hint },
  hintTextActive: { color: COLORS.primaryDark, fontWeight: '500' },
  confirmButton: { backgroundColor: COLORS.secondary, borderRadius: 14, padding: 18, alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.35 },
  confirmText: { fontSize: 15, fontWeight: '500', color: COLORS.text.white },
});

export default RegionSelectScreen;