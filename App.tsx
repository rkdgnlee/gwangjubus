import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

const App = () => {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6">
        {/* 헤더 */}
        <Text className="text-2xl font-bold text-slate-900">광주버스 RN 🚌</Text>
        
        {/* 카드 예시 */}
        <View className="mt-6 p-5 bg-white rounded-3xl shadow-lg shadow-slate-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-slate-500 font-medium">첨단 09</Text>
              <Text className="text-xl font-bold text-slate-900 mt-1">광주역 방면</Text>
            </View>
            <View className="bg-rose-100 px-3 py-1 rounded-full">
              <Text className="text-rose-600 font-bold">3분후</Text>
            </View>
          </View>
          
          <View className="mt-4 pt-4 border-t border-slate-100">
            <Text className="text-slate-600">현재 위치: 전남대사거리</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;