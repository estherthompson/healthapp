declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  export default class Ionicons extends Component<
    TextProps & { name: string; size?: number; color?: string }
  > {}
}
