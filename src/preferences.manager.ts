/**
 * PreferencesManager
 *
 * Handle getting and setting of user preferences.
 *
 * @export
 * @class PreferencesManager
 * @version 1.0.0
 */
export default class PreferencesManager {
    accent: string | null; // Holds current accent.
    accents: string[]; // List of all available accents.
    gradient: string | null; // Holds current gradient.
    gradients: string[]; // List of all available gradients.
    theme: string | null; // Holds current theme.

    constructor() {
        // Create list of all available accents.
        this.accents = ['red', 'purple', 'pink', 'blue', 'teal', 'green', 'yellow', 'orange', 'deep-orange'];

        // Create list of all available gradients.
        this.gradients = [
            'JShine',
            'MegaTron',
            'Yoda',
            'Amin',
            'WitchingHour',
            'Flare',
            'KyooPal',
            'KyeMeh',
            'ByDesign',
            'BurningOrange',
            'Wiretap',
            'SummerDog',
            'SinCityRed',
            'BlueRaspberry',
            'eXpresso',
            'Quepal',
        ];

        // Store current user preferences.
        this.accent = this.get('accent');
        this.gradient = this.get('gradient');
        this.theme = this.get('theme');

        // If no user preferences exist yet, save default values.
        this.setDefaults();
    }

    /**
     * get
     *
     * Get given setting from localStorage.
     *
     * @param {string} setting Setting to look up
     * @memberof PreferencesManager
     * @since 1.0.0
     */
    get = (setting: string): string | null => {
        return localStorage.getItem(`app-${setting}`);
    };

    /**
     * set
     *
     * Save given setting to localStorage.
     *
     * @param {string} setting Setting to save `accent`, `gradient` or `theme`
     * @param {string} value Setting value
     * @memberof PreferencesManager
     * @since 1.0.0
     */
    set = (setting: string, value: string): void => {
        localStorage.setItem(`app-${setting}`, value);
    };

    /**
     * setDefaults
     *
     * Save default values to localStorage.
     *
     * @memberof PreferencesManager
     * @since 1.0.0
     */
    setDefaults = () => {
        if (!this.accent) {
            this.set('accent', 'green');
        }

        if (!this.gradient) {
            this.set('gradient', 'Quepal');
        }

        if (!this.theme) {
            this.set('theme', 'light');
        }
    };

    /**
     * applyPreferences
     *
     * Apply user preferences to the DOM.
     *
     * @memberof PreferencesManager
     * @since 1.0.0
     */
    applyPreferences = () => {
        // Get the app container element.
        const appContainer = document.querySelector('.mdf-app');

        if (appContainer) {
            // Add the gradient to the app container.
            appContainer.classList.add(`mdf-gradient-${this.gradient ? this.gradient : this.get('gradient')}`);
        }

        // Add the accent class to the document's body.
        document.body.classList.add(`mdf-accent-${this.accent ? this.accent : this.get('accent')}`);

        // Add the theme class to the document's body.
        if (this.theme && this.theme === 'dark') {
            document.body.classList.add('mdf-theme-dark');
        }
    };
}
