import React from 'react';
import {ButtonAction, TextButton} from './styles';
import {ButtonProps} from '../../../types/types';

export default function Button({title, style, handleAction}: ButtonProps) {
  return (
    <>
      <ButtonAction style={style} onPress={handleAction}>
        <TextButton>{title}</TextButton>
      </ButtonAction>
    </>
  );
}
