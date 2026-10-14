import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Linking,
  Clipboard,
} from 'react-native';
import { storage } from '../../utils/storage';
import HistoryManageScreen from '../My/HistoryManageScreen';
import FavoriteManageScreen from '../My/FavoriteManageScreen';
import { COLORS } from '../../constants/theme';
import updateNotes from '../../constants/updateNotes.json';
import { requestReview } from '@apps-in-toss/framework';
import { useTicket } from '../../hooks/tickets/TicketContext';
import { useFullScreenAd } from '../../hooks/ticket/useFullScreenAd';
import { useBackHandler } from '../../hooks/useBackHandler';
import { ChevronRight } from '../../components/Icons';

interface SettingsProps {
  cityName: string;
  onChangeRegion: () => void;
  initialShowHistoryManage?: boolean;
  onDidMount?: () => void;
}

const SettingsContainer = ({
  onChangeRegion,
  initialShowHistoryManage = false,
  onDidMount,
}: SettingsProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHistoryManage, setShowHistoryManage] = useState(initialShowHistoryManage);
  const [showFavoriteManage, setShowFavoriteManage] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showUpdateNotes, setShowUpdateNotes] = useState(false);

  // 업데이트 내역은 src/constants/updateNotes.json 에서 관리 (최신이 맨 앞)
  const latestUpdate = updateNotes[0]!;
  const previousUpdate = updateNotes[1];

  const { tickets } = useTicket();
  const { isAdLoading, showAd } = useFullScreenAd();
  const { rewardTickets } = useTicket();

  useEffect(() => {
    onDidMount?.();
  }, []);

  const handleRegionChange = () => {
    Alert.alert('지역 변경', '지역을 변경하시겠습니까?\n처음 화면으로 돌아갑니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '변경',
        onPress: async () => {
          await storage.clear();
          onChangeRegion();
        },
      },
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
    const email = 'sardinespicysalad@gmail.com';
    const subject = encodeURIComponent('[광주버스] 개발자 피드백');
    const body = encodeURIComponent('의견을 자유롭게 작성해주세요.');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => setShowEmailModal(true));
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('복사 완료', '이메일 주소가 클립보드에 복사되었습니다.');
  };

  const handleAdReward = async () => {
    await rewardTickets();
    setShowTicketDialog(false);
  };

  // 상단 내비게이션 바 뒤로가기: 하위 관리 화면 → 설정 메인
  useBackHandler(showHistoryManage || showFavoriteManage, () => {
    setShowHistoryManage(false);
    setShowFavoriteManage(false);
  });

  if (showHistoryManage) {
    return <HistoryManageScreen />;
  }

  if (showFavoriteManage) {
    return <FavoriteManageScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>설정</Text>

      {/* 업데이트 소식 카드 — 누르면 업데이트 내용 다이얼로그 */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => setShowUpdateNotes(true)}
        activeOpacity={0.8}
        accessibilityLabel="업데이트 내용 보기"
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🗓️</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.featureTitle}>버쓩-전국 시내 버스</Text>
          <Text style={styles.featureDesc} numberOfLines={1}>
            {latestUpdate.summary}
          </Text>
          <Text style={styles.updateDate}>
            최근 업데이트 {latestUpdate.date}
            {previousUpdate ? ` · 이전 ${previousUpdate.date}` : ''}
          </Text>
        </View>
        <ChevronRight color={COLORS.text.muted} />
      </TouchableOpacity>

      {/* 메뉴 리스트 */}
      <View style={styles.menuContainer}>
        {/* 티켓 충전 */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => setShowTicketDialog(true)}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemIcon}>🎟️</Text>
            <View>
              <Text style={styles.itemTitle}>검색 티켓 충전</Text>
              <Text style={styles.itemSub}>현재 {tickets ?? 0}개 보유 중</Text>
            </View>
          </View>
          <ChevronRight color={COLORS.text.muted} />
        </TouchableOpacity>

        <SettingsItem title="지역 변경" onPress={handleRegionChange} icon="🌏" />
        <SettingsItem title="앱 평가하기" onPress={handleRating} icon="⭐️" />
        <SettingsItem title="개발자 피드백" onPress={handleFeedback} icon="💬" />
        <SettingsItem
          title="탑승 기록 관리"
          onPress={() => setShowHistoryManage(true)}
          icon="🗂️"
        />
        <SettingsItem
          title="북마크 관리"
          onPress={() => setShowFavoriteManage(true)}
          icon="🔖"
        />
        <SettingsItem
          title="출처 및 오픈소스 라이선스"
          onPress={() => Alert.alert('오픈소스 라이선스', '출처: 공공데이터포털')}
          icon="📄"
        />
      </View>

      {/* 티켓 충전 모달 - 실제 광고 로드/표시는 RewardAd가 담당 */}
      <Modal
        transparent
        visible={showTicketDialog}
        animationType="fade"
        onRequestClose={() => setShowTicketDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎟️ 티켓 충전</Text>
            <Text style={styles.modalDesc}>
              광고를 시청하고 티켓 20개를 충전하시겠습니까?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowTicketDialog(false)}
              >
                <Text style={styles.modalBtnTextCancel}>닫기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnSubmit, isAdLoading ? styles.modalBtnDisabled : null]}
                onPress={() => {
                  // RN Modal이 떠 있으면 전면 광고 표시가 실패하므로 닫힌 뒤에 띄운다
                  setShowTicketDialog(false);
                  setTimeout(() => showAd(handleAdReward), 400);
                }}
                disabled={isAdLoading}
              >
                <Text
                  style={[
                    styles.modalBtnTextSubmit,
                    isAdLoading ? styles.modalBtnTextDisabled : null,
                  ]}
                >
                  {isAdLoading ? '광고 로딩 중...' : '광고 보고 충전'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 업데이트 내역 모달 */}
      <Modal
        transparent
        visible={showUpdateNotes}
        animationType="fade"
        onRequestClose={() => setShowUpdateNotes(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>업데이트 내용</Text>
            <Text style={styles.updateNoteDate}>{latestUpdate.date}</Text>
            <View style={styles.updateNoteList}>
              {latestUpdate.details.map((line) => (
                <Text key={line} style={styles.updateNoteLine}>
                  • {line}
                </Text>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.modalBtnSubmit, styles.updateNoteClose]}
              onPress={() => setShowUpdateNotes(false)}
            >
              <Text style={styles.modalBtnTextSubmit}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 이메일 복사 모달 */}
      <Modal transparent visible={showEmailModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>개발자 이메일</Text>
            <Text style={styles.emailDescription}>
              메일 앱을 실행할 수 없습니다.{'\n'}아래 주소를 복사해서 사용해주세요.
            </Text>
            <View style={styles.emailBox}>
              <Text selectable={true} style={styles.selectableEmail}>
                sardinespicysalad@gmail.com
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={styles.modalBtnTextCancel}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSubmit}
                onPress={() => copyToClipboard('sardinespicysalad@gmail.com')}
              >
                <Text style={styles.modalBtnTextSubmit}>복사하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const SettingsItem = ({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon: string;
}) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <ChevronRight color={COLORS.text.muted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 16 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.text.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 22 },
  profileInfo: { flex: 1, justifyContent: 'center', marginRight: 8 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.main, marginBottom: 2 },
  featureDesc: { fontSize: 14, color: COLORS.text.sub, lineHeight: 20 },
  menuContainer: {
    backgroundColor: COLORS.text.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { fontSize: 20, marginRight: 12 },
  itemTitle: { fontSize: 16, color: COLORS.text.main },
  itemSub: { fontSize: 13, color: COLORS.text.hint, marginTop: 2 },
  updateDate: { fontSize: 13, color: COLORS.text.hint, marginTop: 4 },
  updateNoteDate: { fontSize: 14, color: COLORS.text.hint, marginBottom: 12 },
  updateNoteList: { alignSelf: 'stretch', marginBottom: 20 },
  updateNoteLine: { fontSize: 14, color: COLORS.text.main, lineHeight: 22 },
  updateNoteClose: { flex: 0, alignSelf: 'stretch', marginLeft: 0 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.text.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: COLORS.text.main },
  modalButtons: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  modalDesc: { fontSize: 16, marginBottom: 20, color: COLORS.text.main, textAlign: 'center' },
  modalBtnSubmit: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  modalBtnDisabled: { backgroundColor: COLORS.border },
  modalBtnTextCancel: { color: COLORS.text.sub },
  modalBtnTextSubmit: { color: COLORS.text.white, fontWeight: 'bold' },
  modalBtnTextDisabled: { color: COLORS.text.muted },
  emailDescription: {
    fontSize: 14,
    color: COLORS.text.hint,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emailBox: {
    backgroundColor: COLORS.border,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  selectableEmail: { fontSize: 15, color: COLORS.text.main, fontWeight: '600' },
});

export default SettingsContainer;