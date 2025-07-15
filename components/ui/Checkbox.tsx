import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({ value, onValueChange, label, disabled = false }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.checkboxContainer, disabled && styles.checkboxDisabled]}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5, // Make it easier to tap
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2f80ed', // A shade of blue
    borderColor: '#2f80ed',
  },
  checkboxDisabled: {
    opacity: 0.6,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
  },
  labelDisabled: {
    color: '#aaa',
  },
});