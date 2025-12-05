// Accessibility Utilities

/**
 * Add ARIA labels to elements
 */
export function addAriaLabels(elements) {
    elements.forEach(({ selector, label, role }) => {
        const element = document.querySelector(selector);
        if (element) {
            if (label) element.setAttribute('aria-label', label);
            if (role) element.setAttribute('role', role);
        }
    });
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Focus trap for modals
 */
export function createFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => element.removeEventListener('keydown', handleTabKey);
}

/**
 * Check color contrast ratio
 */
export function getContrastRatio(foreground, background) {
    const getLuminance = (color) => {
        const rgb = color.match(/\d+/g).map(Number);
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
        ratio: ratio.toFixed(2),
        passAA: ratio >= 4.5,
        passAAA: ratio >= 7
    };
}

/**
 * Skip to content link
 */
export function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #007bff;
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Keyboard navigation helper
 */
export function enableKeyboardNavigation(container) {
    const items = container.querySelectorAll('[data-keyboard-nav]');
    let currentIndex = 0;

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, items.length - 1);
                items[currentIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                items[currentIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                currentIndex = 0;
                items[0].focus();
                break;
            case 'End':
                e.preventDefault();
                currentIndex = items.length - 1;
                items[currentIndex].focus();
                break;
        }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
}
