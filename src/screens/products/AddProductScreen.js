import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { createProduct, fetchProducts } from '../../store/slices/productSlice';
import { ScreenContainer, Input, Button, AutocompleteInput } from '../../components';
import { productService } from '../../services/product.service';
import { spacing } from '../../theme';

const UNITS = ['Grams', 'KG', 'Tons', 'Packet', 'Piece', 'Dozen', 'CM', 'M', 'Inch', 'Bag'];

// Simple debounce utility
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const AddProductScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [currentStock, setCurrentStock] = useState('');
    const [minStockLevel, setMinStockLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [attributes, setAttributes] = useState({ categories: [], products: [] });
    const dispatch = useDispatch();

    useEffect(() => {
        loadAttributes();
        // Also load categories initially
        loadAttributes('', 'category');
    }, []);

    const loadAttributes = async (query = '', key = 'product') => {
        try {
            const response = await productService.getAttributes(query, key);
            if (response.success && response.data) {
                setAttributes(prev => ({
                    ...prev,
                    [key === 'category' ? 'categories' : 'products']: response.data || [],
                }));
            }
        } catch (error) {
            console.log('Error loading attributes:', error);
        }
    };

    // Create debounced function
    const debouncedLoadAttributes = useCallback(
        debounce((text, key) => loadAttributes(text, key), 500),
        []
    );

    const handleNameChange = (text, key = 'product') => {
        if (key === 'product') setName(text);
        else if (key === 'category') setCategory(text);
        debouncedLoadAttributes(text, key);
    };

    const handleProductSelect = (productOrName) => {
        const product = (typeof productOrName === 'string')
            ? attributes.products.find(p => p.name === productOrName)
            : productOrName;

        if (product) {
            if (product.unit) setUnit(product.unit);
            if (product.category) setCategory(product.category);
        }
    };

    const handleSubmit = async () => {
        if (!name || !category || !unit || !sellingPrice) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await dispatch(
                createProduct({
                    name,
                    category,
                    unit,
                    purchasePrice: parseFloat(purchasePrice) || 0,
                    sellingPrice: parseFloat(sellingPrice),
                    currentStock: parseFloat(currentStock) || 0,
                    minStockLevel: parseFloat(minStockLevel) || 0,
                })
            ).unwrap();

            Alert.alert('Success', 'Product added successfully');
            // Refresh list
            dispatch(fetchProducts());
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <AutocompleteInput
                    label="Product Name *"
                    value={name}
                    onChangeText={(text) => handleNameChange(text, 'product')}
                    placeholder="e.g., UltraTech Cement"
                    data={attributes.products || []}
                    onSuggestionPress={handleProductSelect}
                />

                <AutocompleteInput
                    label="Category *"
                    value={category}
                    onChangeText={(text) => handleNameChange(text, 'category')}
                    placeholder="e.g., Cement, Iron Rod, Sand"
                    data={attributes.categories || []}
                />

                <AutocompleteInput
                    label="Unit *"
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="e.g., Bag, Kg, Ton, Piece"
                    data={UNITS}
                />

                <Input
                    label="Purchase Price"
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    placeholder="Enter purchase price"
                    keyboardType="numeric"
                />

                <Input
                    label="Selling Price *"
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    placeholder="Enter selling price"
                    keyboardType="numeric"
                />

                <Input
                    label="Current Stock"
                    value={currentStock}
                    onChangeText={setCurrentStock}
                    placeholder="Enter current stock quantity"
                    keyboardType="numeric"
                />

                <Input
                    label="Minimum Stock Level"
                    value={minStockLevel}
                    onChangeText={setMinStockLevel}
                    placeholder="Alert when stock falls below this"
                    keyboardType="numeric"
                />

                <Button
                    title={loading ? 'Saving...' : 'Save Product'}
                    onPress={handleSubmit}
                    loading={loading}
                    fullWidth
                    style={styles.button}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    button: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
});

export default AddProductScreen;
