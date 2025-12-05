'use client';

import { useState, useEffect } from 'react';
import styles from './CurrencySelector.module.css';
import multiCurrencyEngine from '@/lib/multiCurrencyEngine';

export default function CurrencySelector({
    value = 'EGP',
    onChange,
    showConverter = false,
    disabled = false
}) {
    const [selectedCurrency, setSelectedCurrency] = useState(value);
    const [currencies, setCurrencies] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Converter state
    const [converterAmount, setConverterAmount] = useState('');
    const [converterFrom, setConverterFrom] = useState('EGP');
    const [converterTo, setConverterTo] = useState('USD');
    const [conversionResult, setConversionResult] = useState(null);

    useEffect(() => {
        const currencyList = multiCurrencyEngine.getSupportedCurrencies();
        setCurrencies(currencyList);
    }, []);

    useEffect(() => {
        setSelectedCurrency(value);
    }, [value]);

    const handleSelect = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        setShowDropdown(false);
        if (onChange) {
            onChange(currencyCode);
        }
    };

    const handleConvert = async () => {
        if (!converterAmount || isNaN(converterAmount)) {
            return;
        }

        try {
            const result = await multiCurrencyEngine.convert(
                parseFloat(converterAmount),
                converterFrom,
                converterTo
            );
            setConversionResult(result);
        } catch (error) {
            console.error('Conversion error:', error);
        }
    };

    const filteredCurrencies = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCurrencyInfo = currencies.find(c => c.code === selectedCurrency);

    return (
        <div className={styles.container}>
            {/* Currency Selector */}
            <div className={styles.selector}>
                <button
                    className={styles.selectorButton}
                    onClick={() => !disabled && setShowDropdown(!showDropdown)}
                    disabled={disabled}
                >
                    {selectedCurrencyInfo ? (
                        <>
                            <span className={styles.currencySymbol}>
                                {selectedCurrencyInfo.symbol}
                            </span>
                            <span className={styles.currencyCode}>
                                {selectedCurrencyInfo.code}
                            </span>
                            <span className={styles.currencyName}>
                                {selectedCurrencyInfo.name}
                            </span>
                        </>
                    ) : (
                        <span>Select Currency</span>
                    )}
                    <span className={styles.arrow}>▼</span>
                </button>

                {showDropdown && (
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search currencies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles.dropdownList}>
                            {filteredCurrencies.map((currency) => (
                                <button
                                    key={currency.code}
                                    className={`${styles.dropdownItem} ${
                                        currency.code === selectedCurrency ? styles.selected : ''
                                    }`}
                                    onClick={() => handleSelect(currency.code)}
                                >
                                    <span className={styles.itemSymbol}>
                                        {currency.symbol}
                                    </span>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemCode}>
                                            {currency.code}
                                        </span>
                                        <span className={styles.itemName}>
                                            {currency.name}
                                        </span>
                                    </div>
                                    {currency.code === selectedCurrency && (
                                        <span className={styles.checkmark}>✓</span>
                                    )}
                                </button>
                            ))}

                            {filteredCurrencies.length === 0 && (
                                <div className={styles.noResults}>
                                    No currencies found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Currency Converter */}
            {showConverter && (
                <div className={styles.converter}>
                    <h3 className={styles.converterTitle}>
                        💱 Currency Converter
                    </h3>

                    <div className={styles.converterGrid}>
                        <div className={styles.converterInput}>
                            <label>Amount</label>
                            <input
                                type="number"
                                value={converterAmount}
                                onChange={(e) => setConverterAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className={styles.converterSelect}>
                            <label>From</label>
                            <select
                                value={converterFrom}
                                onChange={(e) => setConverterFrom(e.target.value)}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className={styles.swapButton}
                            onClick={() => {
                                const temp = converterFrom;
                                setConverterFrom(converterTo);
                                setConverterTo(temp);
                                if (conversionResult) {
                                    handleConvert();
                                }
                            }}
                            title="Swap currencies"
                        >
                            ⇄
                        </button>

                        <div className={styles.converterSelect}>
                            <label>To</label>
                            <select
                                value={converterTo}
                                onChange={(e) => setConverterTo(e.target.value)}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className={styles.convertButton}
                            onClick={handleConvert}
                            disabled={!converterAmount}
                        >
                            Convert
                        </button>
                    </div>

                    {conversionResult && (
                        <div className={styles.result}>
                            <div className={styles.resultAmount}>
                                <span className={styles.originalAmount}>
                                    {multiCurrencyEngine.format(
                                        conversionResult.originalAmount,
                                        conversionResult.originalCurrency
                                    )}
                                </span>
                                <span className={styles.resultArrow}>→</span>
                                <span className={styles.convertedAmount}>
                                    {multiCurrencyEngine.format(
                                        conversionResult.convertedAmount,
                                        conversionResult.convertedCurrency
                                    )}
                                </span>
                            </div>

                            <div className={styles.resultDetails}>
                                <span>Exchange Rate: 1 {conversionResult.originalCurrency} = {conversionResult.exchangeRate} {conversionResult.convertedCurrency}</span>
                                <span className={styles.resultTime}>
                                    Updated: {new Date(conversionResult.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
