import React, {useEffect, useState, useRef} from 'react';
import {Platform, PermissionsAndroid, Dimensions, Alert} from 'react-native';
import {
  Container,
  StyledMapView,
  GooglePlacesAutocompleteView,
  GooglePlacesDestinationView,
  ClearInputAddress,
  ClearInputAddressText,
} from './styles';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAPS_API_KEY} from '../../constants/index';
import {Coordinates} from '../../../types/types';
import Button from '../../components/Button';

const {width, height} = Dimensions.get('screen');

export function Home() {
  const [locationDevice, setLocationDevice] = useState<Coordinates | null>(
    null,
  );
  const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(false);
  const [origin, setOrigin] = useState<Coordinates | null>();
  const [destination, setDestination] = useState<Coordinates | null>();
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null,
  );
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const mapRef = useRef<MapView>(null);
  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationRef = useRef<GooglePlacesAutocompleteRef>(null);

  async function requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'Este aplicativo precisa acessar sua localização.',
            buttonNeutral: 'Pergunte-me depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  async function getLocationDevide() {
    const resp = await requestLocationPermission();
    if (resp) {
      Geolocation.getCurrentPosition(
        position => {
          const cords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocationDevice(cords);
        },
        error => {
          console.error('Erro ao obter localização:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    }
  }

  function handleAddAddress() {
    setShowGoogleAutocomplete(prevState => !prevState);
  }

  async function moveToLocation(coords: Coordinates) {
    const region: Region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0155,
      longitudeDelta: 0.0155,
    };

    mapRef.current?.animateToRegion(region, 2000);
  }

  function clearInput(type: string) {
    if (type === 'origin' && originRef.current) {
      originRef.current.clear();
      setOrigin(null);
    } else if (type === 'destination' && destinationRef.current) {
      destinationRef.current.clear();
      setDestination(null);
    }
  }

  useEffect(() => {
    getLocationDevide();
  }, []);

  function startRoute() {
    let index = 0;
    const interval = setInterval(() => {
      if (index < routeCoords.length) {
        const nextCoord = routeCoords[index];
        setCurrentLocation(nextCoord);
        mapRef?.current?.animateCamera({
          center: nextCoord,
          zoom: 16,
        });
        index++;
      } else {
        clearInterval(interval);
        setOrigin(null);
        setDestination(null);
        setRouteCoords([]);
        successYouArrivedYour();
      }
    }, 1000);
  }

  function successYouArrivedYour() {
    Alert.alert(
      'Sucesso',
      'Você chegou a seu destino!',
      [{text: 'Ok', onPress: () => {}}],
      {cancelable: true},
    );
  }

  return (
    <Container>
      {showGoogleAutocomplete && (
        <GooglePlacesAutocompleteView>
          <GooglePlacesDestinationView>
            <ClearInputAddress onPress={() => clearInput('origin')}>
              <ClearInputAddressText>X</ClearInputAddressText>
            </ClearInputAddress>
            <GooglePlacesAutocomplete
              fetchDetails={true}
              debounce={300}
              styles={{
                textInput: {
                  color: '#5d5d5d',
                  fontSize: 14,
                  paddingRight: 15,
                },
              }}
              ref={originRef}
              placeholder="Origem"
              onPress={(data, details = null) => {
                let originCoordinates = {
                  latitude: details?.geometry?.location.lat,
                  longitude: details?.geometry?.location.lng,
                };
                moveToLocation(originCoordinates);
                setOrigin(originCoordinates);
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
            />
          </GooglePlacesDestinationView>

          <GooglePlacesDestinationView>
            <ClearInputAddress onPress={() => clearInput('destination')}>
              <ClearInputAddressText>X</ClearInputAddressText>
            </ClearInputAddress>
            <GooglePlacesAutocomplete
              fetchDetails={true}
              debounce={300}
              styles={{
                textInput: {
                  color: '#5d5d5d',
                  fontSize: 14,
                  paddingRight: 15,
                },
              }}
              ref={destinationRef}
              placeholder="Destino"
              onPress={(data, details = null) => {
                let destinationCoordinates: Coordinates = {
                  latitude: details?.geometry?.location.lat,
                  longitude: details?.geometry?.location.lng,
                };
                moveToLocation(destinationCoordinates);
                setDestination(destinationCoordinates);
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
            />
          </GooglePlacesDestinationView>
        </GooglePlacesAutocompleteView>
      )}
      {locationDevice && (
        <StyledMapView
          initialRegion={{
            latitude: locationDevice?.latitude,
            longitude: locationDevice?.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          ref={mapRef}
          zoomEnabled={true}
          showsUserLocation={true}
          loadingEnabled={true}
          provider={PROVIDER_GOOGLE}
          style={{width, height}}
          pointerEvents="box-none">
          {currentLocation && <Marker coordinate={currentLocation} />}
          {origin ? <Marker coordinate={origin} /> : null}
          {destination ? <Marker coordinate={destination} /> : null}
          {origin && destination ? (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeColor="blue"
              strokeWidth={3}
              onReady={result => {
                setRouteCoords(result?.coordinates);
              }}
            />
          ) : null}
        </StyledMapView>
      )}
      {origin && destination && (
        <Button
          style={{backgroundColor: 'green'}}
          title="Iniciar"
          handleAction={startRoute}
        />
      )}
      <Button
        style={{backgroundColor: 'blue'}}
        title="+"
        handleAction={handleAddAddress}
      />
    </Container>
  );
}
