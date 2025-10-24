import { styles } from '@/assets/styles/Home.styles';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reconnaissance de salles</Text>
      <Text style={styles.subtitle}>IUT de Metz</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Caméra</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Importer</Text>
      </TouchableOpacity>

    </View>
  );
}
