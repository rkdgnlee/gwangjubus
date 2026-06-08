import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const TITLE = "이용할 도시를 선택해주세요 🏙️";
const SUBTITLE = "설정에서 언제든지 변경할 수 있습니다";

const TypingHeader = () => {
  const [titleText, setTitleText] = useState('');
  const [subText, setSubText] = useState('');
  const [isTitleDone, setIsTitleDone] = useState(false);

  // 제목 타이핑
  useEffect(() => {
    if (titleText.length < TITLE.length) {
      const timeout = setTimeout(() => {
        setTitleText(TITLE.slice(0, titleText.length + 1));
      }, 70); 
      return () => clearTimeout(timeout);
    } else {
      setIsTitleDone(true);
    }
  }, [titleText]);

  // 부제목 타이핑 (제목이 끝난 후 시작)
  useEffect(() => {
    if (isTitleDone && subText.length < SUBTITLE.length) {
      const timeout = setTimeout(() => {
        setSubText(SUBTITLE.slice(0, subText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTitleDone, subText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titleText}</Text>
      <Text style={styles.subtitle}>{subText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    height: 100, 
    justifyContent: 'center', 
    paddingHorizontal: 25, 
    marginTop: 40 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: COLORS.text.main, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: COLORS.text.hint 
  }
});

export default TypingHeader;