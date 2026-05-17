import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

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
          placeholder="버스 번호, 정류장 이름"
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
    backgroundColor: COLORS.text.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight, // 연한 블루 배경
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingRight: 8, // 버튼과의 간격을 위해 오른쪽 패딩 조정
    height: 50,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.text.main, height: '100%' },
  searchButton: {
    backgroundColor: COLORS.primary, // 메인 다저 블루
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.white,
  },
});

export default SearchBar;