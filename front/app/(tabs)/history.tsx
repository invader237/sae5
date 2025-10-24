import { styles } from '@/assets/styles/History.styles';
import { Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.text}>Aucun historique pour le moment.</Text>
    </View>
  );
}

