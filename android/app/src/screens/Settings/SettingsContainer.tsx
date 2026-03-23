import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { storage } from '../../utils/storage';

interface SettingsProps {
  cityName: string;
  onChangeRegion: () => void;
}

const SettingsContainer = ({ cityName, onChangeRegion }: SettingsProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 더미 로그인 상태
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleLogin = () => {
    // 실제 로그인 로직 대신 토글
    setIsLoggedIn(!isLoggedIn);
    if (!isLoggedIn) Alert.alert("로그인", "로그인 되었습니다.");
    else Alert.alert("로그아웃", "로그아웃 되었습니다.");
  };

  const handleRegionChange = () => {
    Alert.alert("지역 변경", "지역을 변경하시겠습니까?\n처음 화면으로 돌아갑니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "변경",
        onPress: async () => {
          // 저장된 도시 정보를 지우고 앱의 상태를 초기화
          await storage.setCity(''); 
          onChangeRegion();
        }
      }
    ]);
  };

  const submitRating = () => {
    setShowRatingModal(false);
    Alert.alert("평가 완료", "소중한 의견 감사합니다!");
    setReview('');
    setRating(5);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. 상단 로그인/회원정보 영역 */}
      <TouchableOpacity style={styles.profileSection} onPress={handleLogin} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isLoggedIn ? "😎" : "👤"}</Text>
        </View>
        <View style={styles.profileInfo}>
          {isLoggedIn ? (
            <>
              <Text style={styles.emailText}>user@gwangjubus.com</Text>
              <Text style={styles.regionText}>현재 지역: <Text style={styles.regionHighlight}>{cityName}</Text></Text>
            </>
          ) : (
            <Text style={styles.loginText}>로그인하기 {'>'}</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 2. 메뉴 리스트 */}
      <View style={styles.menuContainer}>
        <SettingsItem title="지역 변경" onPress={handleRegionChange} icon="🌏" />
        <SettingsItem title="앱 평가하기" onPress={() => setShowRatingModal(true)} icon="⭐️" />
        <SettingsItem 
          title="개발자 피드백" 
          onPress={() => Alert.alert("피드백", "개발자에게 의견을 보냅니다.\n(dev@example.com)")} 
          icon="💬" 
        />
        <SettingsItem 
          title="출처 및 오픈소스 라이선스" 
          onPress={() => Alert.alert("오픈소스 라이선스", "React Native\nIcons by ...")} 
          icon="📄" 
        />
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionTitle}>앱 버전</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      {/* 3. 앱 평가 모달 (Dialog) */}
      <Modal transparent visible={showRatingModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>앱 평가하기</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput 
              style={styles.reviewInput} 
              placeholder="후기를 남겨주세요" 
              multiline 
              value={review}
              onChangeText={setReview}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowRatingModal(false)}>
                <Text style={styles.modalBtnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSubmit} onPress={submitRating}>
                <Text style={styles.modalBtnTextSubmit}>보내기</Text>
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
  container: { flex: 1, backgroundColor: '#F5FBF6' },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 64,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#EEF6F0',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 30 },
  profileInfo: { justifyContent: 'center' },
  emailText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  regionText: { fontSize: 14, color: '#666' },
  regionHighlight: { color: '#2E7D32', fontWeight: 'bold' },
  loginText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  divider: { height: 8, backgroundColor: '#F2F4F6' },
  
  menuContainer: { paddingVertical: 10, backgroundColor: '#fff', flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 20, marginRight: 12 },
  itemTitle: { fontSize: 16, color: '#333' },
  itemArrow: { fontSize: 20, color: '#ccc' },

  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  versionTitle: { fontSize: 14, color: '#888' },
  versionText: { fontSize: 14, color: '#888' },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  starsContainer: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 32, color: '#ddd', marginHorizontal: 4 },
  starActive: { color: '#FFD700' },
  reviewInput: { width: '100%', height: 80, borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8, borderRadius: 8, backgroundColor: '#f0f0f0' },
  modalBtnSubmit: { flex: 1, padding: 12, alignItems: 'center', marginLeft: 8, borderRadius: 8, backgroundColor: '#ADEBB3' },
  modalBtnTextCancel: { color: '#666' },
  modalBtnTextSubmit: { color: '#191F28', fontWeight: 'bold' },
});

export default SettingsContainer;
