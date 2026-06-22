import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Linking, Clipboard, Platform, ActivityIndicator } from 'react-native';
import { storage } from '../../utils/storage';
import HistoryManageScreen from '../My/HistoryManageScreen';
import { COLORS } from '../../constants/theme';
import { version } from '../../../package.json';
import { requestReview } from '@apps-in-toss/framework';
import { useTicket } from '../../hooks/ticket/useTicket';
import { AdComponent } from '../../components/ads/AdComponent';

interface SettingsProps {
  cityName: string;
  onChangeRegion: () => void;
}

const SettingsContainer = ({ onChangeRegion }: SettingsProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHistoryManage, setShowHistoryManage] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showAdPhase, setShowAdPhase] = useState(false);

  const { tickets, rewardTickets } = useTicket();

  const handleFeatureNotice = () => {
    Alert.alert("준비 중인 기능", "실제 버스 탑승 기록을 기반으로 나만의 이동 타임라인을 만드는 기능이 업데이트될 예정입니다.");
  };

  const handleRegionChange = () => {
    Alert.alert("지역 변경", "지역을 변경하시겠습니까?\n처음 화면으로 돌아갑니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "변경",
        onPress: async () => {
          await storage.clear();
          onChangeRegion();
        }
      }
    ]);
  };

  const handleRating = async () => {
    try {
      await requestReview();
    } catch (error) {
      console.error('리뷰 요청 실패:', error);
    }
  };

  const handleFeedback = () => {
    const email = 'sardinespicysalad@google.com';
    const subject = encodeURIComponent('[광주버스] 개발자 피드백');
    const body = encodeURIComponent('의견을 자유롭게 작성해주세요.');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => setShowEmailModal(true));
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("복사 완료", "이메일 주소가 클립보드에 복사되었습니다.");
  };

  const handleAdReward = async () => {
    await rewardTickets();
    setShowAdPhase(false);
    setShowTicketDialog(false);
  };

  if (showHistoryManage) {
    return <HistoryManageScreen onBack={() => setShowHistoryManage(false)} />;
  }

  // 광고 전체화면
  if (showAdPhase) {
    return (
      <AdComponent
        tickets={tickets ?? 0}
        onReward={handleAdReward}
        onClose={() => setShowAdPhase(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 상단 프로필 영역 */}
      <TouchableOpacity style={styles.profileSection} onPress={handleFeatureNotice} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🗓️</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.featureTitle}>버쓩-전국 시내 버스</Text>
          <Text style={styles.featureDesc}>내 기록을 저장하고{"\n"}나만의 버스 기록을 저장해보세요</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 메뉴 리스트 */}
      <View style={styles.menuContainer}>

        {/* 티켓 충전 - 첫 번째 메뉴 */}
        <TouchableOpacity style={styles.itemContainer} onPress={() => setShowTicketDialog(true)}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemIcon}>🎟️</Text>
            <View>
              <Text style={styles.itemTitle}>검색 티켓 충전</Text>
              <Text style={styles.itemSub}>현재 {tickets ?? 0}개 보유 중</Text>
            </View>
          </View>
          <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>

        <SettingsItem title="지역 변경" onPress={handleRegionChange} icon="🌏" />
        <SettingsItem title="앱 평가하기" onPress={handleRating} icon="⭐️" />
        <SettingsItem title="개발자 피드백" onPress={handleFeedback} icon="💬" />
        <SettingsItem title="탑승 기록 관리" onPress={() => setShowHistoryManage(true)} icon="🗂️" />
        <SettingsItem
          title="출처 및 오픈소스 라이선스"
          onPress={() => Alert.alert("오픈소스 라이선스", "출처: 공공데이터포털")}
          icon="📄"
        />

        <View style={styles.versionContainer}>
          <Text style={styles.versionTitle}>앱 버전</Text>
          <Text style={styles.versionText}>{version}</Text>
        </View>
      </View>

      {/* 티켓 충전 다이얼로그 */}
      <Modal transparent visible={showTicketDialog} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎟️ 검색 티켓</Text>

            <View style={styles.ticketInfoBox}>
              <Text style={styles.ticketCount}>{tickets ?? 0}개</Text>
              <Text style={styles.ticketLabel}>현재 보유 티켓</Text>
            </View>

            <Text style={styles.ticketDesc}>
              버스·정류장 검색 결과를{'\n'}선택할 때마다 티켓 1개가 소모돼요.{'\n'}광고를 보면 75개를 충전할 수 있어요.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowTicketDialog(false)}
              >
                <Text style={styles.modalBtnTextCancel}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSubmit}
                onPress={() => setShowAdPhase(true)}
              >
                <Text style={styles.modalBtnTextSubmit}>광고 보고 충전</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 이메일 복사 모달 */}
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 24,
    backgroundColor: COLORS.text.white,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  avatarText: { fontSize: 30 },
  profileInfo: { justifyContent: 'center' },
  featureTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: COLORS.text.hint, lineHeight: 18 },
  divider: { height: 8, backgroundColor: COLORS.border },
  menuContainer: { paddingVertical: 10, backgroundColor: COLORS.text.white, flex: 1 },
  itemContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 20, marginRight: 12 },
  itemTitle: { fontSize: 16, color: COLORS.text.main },
  itemSub: { fontSize: 12, color: COLORS.text.hint, marginTop: 2 },
  itemArrow: { fontSize: 20, color: COLORS.text.muted },
  versionContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 18, paddingHorizontal: 24, marginTop: 10,
  },
  versionTitle: { fontSize: 14, color: COLORS.text.sub },
  versionText: { fontSize: 14, color: COLORS.text.sub },

  // 공통 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: COLORS.text.white, borderRadius: 20, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.text.main },
  modalButtons: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8, borderRadius: 8, backgroundColor: COLORS.border },
  modalBtnSubmit: { flex: 1, padding: 12, alignItems: 'center', marginLeft: 8, borderRadius: 8, backgroundColor: COLORS.primary },
  modalBtnTextCancel: { color: COLORS.text.sub },
  modalBtnTextSubmit: { color: COLORS.text.white, fontWeight: 'bold' },

  // 티켓 다이얼로그
  ticketInfoBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40,
    alignItems: 'center', marginBottom: 16, width: '100%',
  },
  ticketCount: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary },
  ticketLabel: { fontSize: 13, color: COLORS.primaryDark, marginTop: 4 },
  ticketDesc: { fontSize: 13, color: COLORS.text.hint, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // 이메일 모달
  emailDescription: { fontSize: 14, color: COLORS.text.hint, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  emailBox: { backgroundColor: COLORS.border, padding: 12, borderRadius: 8, width: '100%', marginBottom: 20, alignItems: 'center' },
  selectableEmail: { fontSize: 15, color: COLORS.text.main, fontWeight: '600' },
});

export default SettingsContainer;