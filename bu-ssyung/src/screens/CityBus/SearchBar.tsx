import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import { SearchIcon } from '../../components/Icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
}

const SearchBar = ({ value, onChangeText, onSearch }: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <View style={styles.searchIcon}>
          <SearchIcon color={COLORS.text.hint} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="버스 번호, 정류장 이름"
          placeholderTextColor={COLORS.text.hint}
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
    paddingVertical: 12,
    backgroundColor: COLORS.text.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    height: 52,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: COLORS.text.main, height: '100%' },
  searchButton: {
    backgroundColor: COLORS.primary, // 메인 다저 블루
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.white,
  },
});

export default SearchBar;