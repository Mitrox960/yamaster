// app/screens/home.screen.js

import { StyleSheet, View, Button } from "react-native";

export default function HomeScreen({ navigation }) {

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
            Waiting for another player...
        </Text>
        <Button
            title="Revenir au menu"
            onPress={() => navigation.navigate('HomeScreen')}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
});
