import { useEffect, useState } from "react";
import { favoriteStorage } from "../utils/favoriteStorage";
import { FavoriteBus } from "../types/favorite";
import { FlatList, Text, View } from "react-native";

interface MainProps {
  cityName: string;
}

const MainScreen = ({ cityName }: MainProps) => {
  const [favorites, setFavorites] = useState<FavoriteBus[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await favoriteStorage.getFavorites();
    setFavorites(data);
  };

  return (
    <View>
      <Text>나의 즐겨찾기 ⭐️</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View >
            <Text >{item.busName}</Text>
            <Text>{item.busStopId} 정류장</Text>
          </View>
        )}
      />
    </View>
  );
};

export default MainScreen;