// styles.ts
import styled from 'styled-components/native';
import MapView from 'react-native-maps';

export const Container = styled.SafeAreaView`
  align-items: flex-end;
  background: white;
`;

export const StyledMapView = styled(MapView)`
  z-index: 0;
`;

export const GooglePlacesAutocompleteView = styled.View`
  width: 100%;
  height: 200px;
  position: absolute;
  z-index: 1;
  flex-direction: row;
`;

export const GooglePlacesDestinationView = styled.View`
  flex: 0.5;
  margin-left: 5px;
  margin-right: 5px;
  flex-direction: row-reverse;
`;

export const ClearInputAddress = styled.TouchableOpacity`
  margin-top: 6%;
  border-radius: 50px;
  z-index: 10;
  left: 12px;
`;

export const ClearInputAddressText = styled.Text`
  color: #000;
  font-size: 16px;
`;
