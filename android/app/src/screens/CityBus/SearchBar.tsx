import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
}

const SearchBar = ({ value, onChangeText, onSearch }: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="버스 번호 또는 정류장 검색"
          placeholderTextColor="#ADB5BD"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {/* 검색 버튼 추가 */}
        <TouchableOpacity onPress={onSearch} style={styles.searchButton} activeOpacity={0.7}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6F0', // 아주 연한 민트 그레이
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingRight: 8, // 버튼과의 간격을 위해 오른쪽 패딩 조정
    height: 50,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333', height: '100%' },
  searchButton: {
    backgroundColor: '#ADEBB3', // 메인 테마 색상
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191F28',
  },
});

export default SearchBar;