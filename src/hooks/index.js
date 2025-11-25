import { useState, useEffect } from 'react';

// Hook for fetching data
export function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url, options);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
}

// Hook for local storage
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// Hook for debounced value
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Hook for window size
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

// Hook for media query
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addListener(listener);

        return () => media.removeListener(listener);
    }, [matches, query]);

    return matches;
}

// Hook for click outside
export function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// Hook for previous value
export function usePrevious(value) {
    const ref = useState();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// Hook for toggle
export function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = () => setValue(v => !v);
    const setTrue = () => setValue(true);
    const setFalse = () => setValue(false);

    return [value, { toggle, setTrue, setFalse, setValue }];
}

// Hook for form
export function useForm(initialValues, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await onSubmit(values);
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        reset,
        setValues,
        setErrors,
    };
}

// Hook for async operation
export function useAsync(asyncFunction, immediate = true) {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (...params) => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction(...params);
            setData(response);
            setStatus('success');
            return response;
        } catch (error) {
            setError(error);
            setStatus('error');
            throw error;
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, []);

    return { execute, status, data, error, loading: status === 'pending' };
}

// Hook for pagination
export function usePagination(items, itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
    };
}

// Hook for interval
export function useInterval(callback, delay) {
    const savedCallback = useState();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

// Hook for copy to clipboard
export function useCopyToClipboard() {
    const [copiedText, setCopiedText] = useState(null);

    const copy = async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            return true;
        } catch (error) {
            console.warn('Copy failed', error);
            setCopiedText(null);
            return false;
        }
    };

    return [copiedText, copy];
}

// Hook for toast notifications
import { toast } from 'react-hot-toast';

export function useToast() {
    return {
        success: (message) => toast.success(message),
        error: (message) => toast.error(message),
        loading: (message) => toast.loading(message),
        dismiss: (toastId) => toast.dismiss(toastId),
        custom: (component) => toast.custom(component),
    };
}
