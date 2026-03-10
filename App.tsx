import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 헤더 */}
        <Text style={styles.header}>광주버스 RN 🚌</Text>

        {/* 카드 */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.busNumber}>첨단 09</Text>
              <Text style={styles.direction}>광주역 방면</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3분후</Text>
            </View>
          </View>

          <View style={styles.divider}>
            <Text style={styles.location}>현재 위치: 전남대사거리</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  content: {
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a', // slate-900
  },
  card: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4, // Android 그림자
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busNumber: {
    fontSize: 14,
    color: '#64748b', // slate-500
    fontWeight: '500',
  },
  direction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a', // slate-900
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#ffe4e6', // rose-100
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#e11d48', // rose-600
    fontWeight: 'bold',
  },
  divider: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9', // slate-100
  },
  location: {
    color: '#475569', // slate-600
  },
});

export default App;