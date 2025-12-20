import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BottomBar } from '../components/BottomBar';
import  LocCards  from '../components/LocCards';

const LOCS = [
  { id: '1', name: 'Posto Central', distance: '200 m', image: 'https://tse1.mm.bing.net/th/id/OIP.aJwjusPtJ70t1a8u_OqWbAHaFR?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3', isFavorited: false },
  { id: '2', name: 'Clínica Saúde', distance: '450 m', image: 'https://tse4.mm.bing.net/th/id/OIP.5oCj3WxYBbbWL9YgJRfV-wHaE7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3', isFavorited: true },
  { id: '3', name: 'UBS Bairro', distance: '1.2 km', image: 'https://th.bing.com/th/id/R.2c19e87d686eee5f84b0a870d0d26156?rik=zQWGS6RK9ujgDA&riu=http%3a%2f%2fimprensaabc.com.br%2fwp-content%2fuploads%2f2020%2f01%2fpoliclinica.jpg&ehk=9gfSVzNuHcqfHubIqY0EJsAQdFsyFGRTCpfIp0dLKdM%3d&risl=&pid=ImgRaw&r=0' },
  { id: '4', name: 'Posto Norte', distance: '2.1 km', image: 'https://agenciapara.com.br/midias/2022/grandes/14600_ba8ec7a3-cc11-228c-0c1c-bd61ce0a31ad.jpg' },
  { id: '5', name: 'Unidade Sul', distance: '3.3 km', image: 'https://tse3.mm.bing.net/th/id/OIP.wKS0ibSloS9QnslCjCOSeAHaE8?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3' },
];

export default function Index() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: -23.55, longitude: -46.63 }}
          title="Posto de Vacinação"
        />
      </MapView>
      <View style={styles.cardContainer}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: '#333' }}>
          Unidades Próximas
        </Text>
        <FlatList
          data={LOCS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LocCards card={item} onFavoritePress={(id) => console.log(id)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
      <BottomBar />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  map: {
    flex: 0.45,
  },
  cardContainer: {
    flex: 0.46,
    backgroundColor: '#CAE3E2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 4,
    paddingHorizontal: 8,
    marginTop: -30,
  },
});
