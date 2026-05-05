import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Linking, Clipboard, Platform } from 'react-native';
import { storage } from '../../utils/storage';
import HistoryManageScreen from '../My/HistoryManageScreen';
import { COLORS } from '../../constants/theme';

interface SettingsProps {
  cityName: string;
  onChangeRegion: () => void;
}

const SettingsContainer = ({ cityName, onChangeRegion }: SettingsProps) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHistoryManage, setShowHistoryManage] = useState(false); // ← 추가

  const handleFeatureNotice = () => {
    Alert.alert("준비 중인 기능", "실제 버스 탑승 기록을 기반으로 나만의 이동 타임라인을 만드는 기능이 업데이트될 예정입니다.");
  };

  const handleRegionChange = () => {
    Alert.alert("지역 변경", "지역을 변경하시겠습니까?\n처음 화면으로 돌아갑니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "변경",
        onPress: async () => {
          // 저장된 도시 정보(이름, 코드)를 모두 지우고 초기화
          await storage.clear(); 
          onChangeRegion();
        }
      }
    ]);
  };

  const handleRating = () => {
    // TODO: 실제 출시 후 발급받은 패키지명과 앱 아이디로 교체하세요.
    const GOOGLE_PACKAGE_NAME = 'com.sardinespicysalad.gwangjubus'; 
    const APPLE_APP_ID = '1234567890'; 

    const url = Platform.OS === 'android'
      ? `market://details?id=${GOOGLE_PACKAGE_NAME}`
      : `itms-apps://itunes.apple.com/app/id${APPLE_APP_ID}?action=write-review`;

    Linking.openURL(url).catch(() => {
      // 스토어 앱을 열 수 없는 경우 브라우저로 연결
      const webUrl = Platform.OS === 'android'
        ? `https://play.google.com/store/apps/details?id=${GOOGLE_PACKAGE_NAME}`
        : `https://apps.apple.com/app/id${APPLE_APP_ID}`;
      
      Linking.openURL(webUrl);
    });
  };

  const handleFeedback = () => {
    const email = 'sardinespicysalad@google.com';
    const subject = encodeURIComponent('[광주버스] 개발자 피드백');
    const body = encodeURIComponent('의견을 자유롭게 작성해주세요.');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.openURL(url).catch(() => {
      setShowEmailModal(true);
    });
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("복사 완료", "이메일 주소가 클립보드에 복사되었습니다.");
  };
  if (showHistoryManage) {
    return <HistoryManageScreen onBack={() => setShowHistoryManage(false)} />;
  }
  return (
    <ScrollView style={styles.container}>
      {/* 1. 상단 로그인/회원정보 영역 */}
      <TouchableOpacity style={styles.profileSection} onPress={handleFeatureNotice} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🗓️</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.featureTitle}>나만의 버스 타임라인</Text>
          <Text style={styles.featureDesc}>버스 탑승 기록을 저장하고{"\n"}나만의 이동 로그를 확인해 보세요 (준비 중)</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 2. 메뉴 리스트 */}
      <View style={styles.menuContainer}>
        <SettingsItem title="지역 변경" onPress={handleRegionChange} icon="🌏" />
        <SettingsItem title="앱 평가하기" onPress={handleRating} icon="⭐️" />
        <SettingsItem 
          title="개발자 피드백" 
          onPress={handleFeedback} 
          icon="💬" 
        />
        <SettingsItem
          title="탑승 기록 관리"
          onPress={() => setShowHistoryManage(true)}
          icon="🗂️"
        />
        <SettingsItem 
          title="출처 및 오픈소스 라이선스" 
          onPress={() => Alert.alert("오픈소스 라이선스", "출처: 공공데이터포털")} 
          icon="📄" 
        />
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionTitle}>앱 버전</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      {/* 이메일 복사 전용 모달 */}
      <Modal transparent visible={showEmailModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>개발자 이메일</Text>
            <Text style={styles.emailDescription}>
              메일 앱을 실행할 수 없습니다.{"\n"}아래 주소를 복사해서 사용해주세요.
            </Text>
            <View style={styles.emailBox}>
              <Text selectable={true} style={styles.selectableEmail}>
                sardinespicysalad@gmail.com
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowEmailModal(false)}>
                <Text style={styles.modalBtnTextCancel}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSubmit} onPress={() => copyToClipboard('sardinespicysalad@google.com')}>
                <Text style={styles.modalBtnTextSubmit}>복사하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

// 리스트 아이템 컴포넌트
const SettingsItem = ({ title, onPress, icon }: { title: string, onPress: () => void, icon: string }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <Text style={styles.itemArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 64,
    paddingBottom: 24,
    backgroundColor: COLORS.text.white,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 30 },
  profileInfo: { justifyContent: 'center' },
  featureTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: COLORS.text.hint, lineHeight: 18 },

  divider: { height: 8, backgroundColor: COLORS.border },
  
  menuContainer: { paddingVertical: 10, backgroundColor: COLORS.text.white, flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 20, marginRight: 12 },
  itemTitle: { fontSize: 16, color: COLORS.text.main },
  itemArrow: { fontSize: 20, color: COLORS.text.muted },

  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  versionTitle: { fontSize: 14, color: COLORS.text.sub },
  versionText: { fontSize: 14, color: COLORS.text.sub },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: COLORS.text.white, borderRadius: 16, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.text.main },
  starsContainer: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 32, color: COLORS.text.muted, marginHorizontal: 4 },
  starActive: { color: '#FFD700' },
  reviewInput: { width: '100%', height: 80, borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8, borderRadius: 8, backgroundColor: COLORS.border },
  modalBtnSubmit: { flex: 1, padding: 12, alignItems: 'center', marginLeft: 8, borderRadius: 8, backgroundColor: COLORS.primary },
  modalBtnTextCancel: { color: COLORS.text.sub },
  modalBtnTextSubmit: { color: COLORS.text.white, fontWeight: 'bold' },

  emailDescription: { fontSize: 14, color: COLORS.text.hint, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  emailBox: { backgroundColor: COLORS.border, padding: 12, borderRadius: 8, width: '100%', marginBottom: 20, alignItems: 'center' },
  selectableEmail: { fontSize: 15, color: COLORS.text.main, fontWeight: '600' },
});

export default SettingsContainer;
