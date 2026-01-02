import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Input from './Input';
import { colors, spacing, typography } from '../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AutocompleteInput = ({
    label,
    value,
    onChangeText,
    onSuggestionPress,
    data = [],
    placeholder,
    containerStyle,
}) => {
    const [visible, setVisible] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [top, setTop] = useState(0); // Position related to screen
    const inputRef = useRef(null);

    useEffect(() => {
        if (value) {
            const filtered = data.filter(item => {
                if (!item) return false;
                if (typeof item === 'string') {
                    return item.toLowerCase().includes(value.toLowerCase()) && item.toLowerCase() !== value.toLowerCase();
                }
                if (typeof item === 'object' && item.name) {
                    return item.name.toLowerCase().includes(value.toLowerCase()) && item.name.toLowerCase() !== value.toLowerCase();
                }
                return false;
            });
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    }, [value, data]);

    const handleFocus = () => {
        // Optionally confirm data is ready
        if (filteredData.length > 0) setVisible(true);
    };

    const handleSelect = (item) => {
        const textValue = typeof item === 'object' ? item.name : item;
        onChangeText(textValue);
        if (onSuggestionPress) {
            onSuggestionPress(item);
        }
        setVisible(false);
    };

    return (
        <View style={[styles.container, containerStyle, { zIndex: visible ? 1000 : 1 }]}>
            <Input
                label={label}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text);
                    if (text.length > 0) {
                        setVisible(true);
                    }
                    else setVisible(false);
                }}
                placeholder={placeholder}
                onFocus={handleFocus}
                onBlur={() => {
                    setTimeout(() => setVisible(false), 200);
                }}
            />

            {visible && filteredData.length > 0 && (
                <View style={styles.dropdown}>
                    <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                        {filteredData.slice(0, 5).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.item}
                                onPress={() => handleSelect(item)}
                            >
                                {typeof item === 'object' ? (
                                    <View>
                                        <Text style={styles.itemText}>{item.name}</Text>
                                        {(item.category || item.unit) && (
                                            <Text style={styles.itemSubText}>
                                                {item.category ? item.category : ''}
                                                {item.category && item.unit ? ' - ' : ''}
                                                {item.unit ? item.unit : ''}
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.itemText}>{item}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default AutocompleteInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        position: 'relative',
    },
    dropdown: {
        position: 'absolute',
        top: '100%', // Position right below the input container
        marginTop: -15, // Negative margin to pull it up slightly overlapping the bottom margin of input
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 5,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    item: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemText: {
        ...typography.body,
        color: colors.textPrimary,
    },
    itemSubText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
});
