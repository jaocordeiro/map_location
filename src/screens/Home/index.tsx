import React, {useEffect, useState, useRef} from 'react';
import {
  Platform,
  PermissionsAndroid,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  Container,
  StyledMapView,
  GooglePlacesAutocompleteView,
  GooglePlacesDestinationView,
  ClearInputAddress,
  ClearInputAddressText,
  AddAddress,
  AddAddressText,
} from './styles';
import {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAPS_API_KEY} from '../../constants/index';

const {width, height} = Dimensions.get('screen');

export function Home() {
  const [locationDevice, setLocationDevice] = useState(null);
  const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(false);
  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);

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
    console.log('resp', resp);

    if (resp) {
      Geolocation.getCurrentPosition(
        position => {
          const cords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocationDevice(cords);
          console.log('cords', cords);
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

  function handlePress() {
    setShowGoogleAutocomplete(prevState => !prevState);
  }

  async function moveToLocation(coords) {
    mapRef?.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      },
      2000,
    );
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
                console.log('originCoordinates', originCoordinates);
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
                let destinationCoordinates = {
                  latitude: details?.geometry?.location.lat,
                  longitude: details?.geometry?.location.lng,
                };
                console.log('destinationCoordinates', destinationCoordinates);
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
          {origin ? <Marker coordinate={origin} /> : null}
          {destination ? <Marker coordinate={destination} /> : null}
          {origin && destination ? (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeColor="blue"
              strokeWidth={3}
            />
          ) : null}
        </StyledMapView>
      )}
      <AddAddress onPress={handlePress}>
        <AddAddressText>+</AddAddressText>
      </AddAddress>
    </Container>
  );
}
