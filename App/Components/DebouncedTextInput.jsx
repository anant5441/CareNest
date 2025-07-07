import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { Text, TextInput } from 'react-native';
import debounce from 'lodash.debounce';

const DebouncedTextInput = memo(({
                                     label,
                                     placeholder,
                                     value,
                                     onChangeText,
                                     delay = 300,
                                     keyboardType = 'default',
                                     autoCapitalize = 'sentences',
                                     style,
                                     inputStyle,
                                     labelStyle,
                                     required = false,
                                     maxLength,
                                     multiline = false,
                                     numberOfLines = 1,
                                     ...otherProps
                                 }) => {
    const [localValue, setLocalValue] = useState(value || '');

    // Create debounced function
    const debouncedOnChange = useMemo(
        () => debounce((text) => {
            onChangeText && onChangeText(text);
        }, delay),
        [onChangeText, delay]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedOnChange.cancel();
        };
    }, [debouncedOnChange]);

    // Update local value when prop value changes
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = useCallback((text) => {
        setLocalValue(text);
        debouncedOnChange(text);
    }, [debouncedOnChange]);

    const handleBlur = useCallback(() => {
        // Immediately trigger onChange on blur to ensure data is saved
        debouncedOnChange.flush();
    }, [debouncedOnChange]);

    return (
        <>
            {label && (
                <Text style={[styles.inputLabel, labelStyle]}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}
            <TextInput
                style={[styles.textInput, inputStyle]}
                placeholder={placeholder}
                value={localValue}
                onChangeText={handleChange}
                onBlur={handleBlur}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="done"
                maxLength={maxLength}
                multiline={multiline}
                numberOfLines={numberOfLines}
                // Performance optimizations
                blurOnSubmit={!multiline}
                textContentType="none"
                spellCheck={false}
                {...otherProps}
            />
        </>
    );
});

// Default styles (you can override these)
const styles = {
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    required: {
        color: '#e74c3c',
        fontSize: 14,
    },
};

DebouncedTextInput.displayName = 'DebouncedTextInput';

export default DebouncedTextInput;