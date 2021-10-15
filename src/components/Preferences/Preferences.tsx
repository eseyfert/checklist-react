import React from 'react';
import PreferencesManager from '../../preferences.manager';
import { removeClassByPrefix } from '../../helpers';

import './Preferences.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface PreferencesProps {
    onBack: () => void;
}

interface PreferencesState {
    accent: string;
    gradient: string;
    useDarkTheme: boolean;
}

/**
 * Preferences
 *
 * Displays the user options to change the visual preferences for the app.
 *
 * @export
 * @class Preferences
 * @extends {React.Component<PreferencesProps, PreferencesState>}
 * @version 1.0.0
 */
export default class Preferences extends React.Component<PreferencesProps, PreferencesState> {
    appContainer!: HTMLElement; // App container element.
    preferences: PreferencesManager; // Handles getting/setting the user settings.

    state = { accent: 'green', gradient: 'Quepal', useDarkTheme: false };

    constructor(props: PreferencesProps) {
        super(props);

        this.preferences = new PreferencesManager();
    }

    /**
     * setAccent
     *
     * Sets the given accent as active.
     *
     * @param {string} accent The desired accent color
     * @memberof Preferences
     * @since 1.0.0
     */
    setAccent = (accent: string) => {
        // Remove the existing accent class.
        removeClassByPrefix(document.body, 'mdf-accent-');

        // Add the newly required accent class.
        document.body.classList.add(`mdf-accent-${accent}`);

        // Store the accent in localStorage.
        this.preferences.set('accent', accent);

        // Update our state.
        this.setState({
            accent: accent,
        });
    };

    /**
     * setGradient
     *
     * Set the given gradient as active.
     *
     * @param {string} gradient The desired background gradient
     * @memberof Preferences
     * @since 1.0.0
     */
    setGradient = (gradient: string) => {
        // Remove the existing gradient class.
        removeClassByPrefix(this.appContainer, 'mdf-gradient-');

        // Add the newly required gradient class.
        this.appContainer.classList.add(`mdf-gradient-${gradient}`);

        // Store the gradient in localStorage.
        this.preferences.set('gradient', gradient);

        // Update our state.
        this.setState({
            gradient: gradient,
        });
    };

    /**
     * toggleTheme
     *
     * Toggle between light and dark theme.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} $event
     * @memberof Preferences
     * @since 1.0.0
     */
    toggleTheme = ($event: React.ChangeEvent<HTMLInputElement>) => {
        // Get the current theme.
        const theme = this.preferences.get('theme');

        if (theme === 'light') {
            // Switch to dark theme.
            document.body.classList.add('mdf-theme-dark');
            this.preferences.set('theme', 'dark');
        } else {
            // Restore light theme.
            document.body.classList.remove('mdf-theme-dark');
            this.preferences.set('theme', 'light');
        }

        // Update our state.
        this.setState({
            useDarkTheme: $event.target.checked,
        });
    };

    /**
     * applyPreferences
     *
     * Load user preferences to our state on mount.
     *
     * @memberof Preferences
     * @since 1.0.0
     */
    applyPreferences = () => {
        this.setState({
            accent: this.preferences.get('accent')!,
            gradient: this.preferences.get('gradient')!,
            useDarkTheme: this.preferences.get('theme') === 'dark' ? true : false,
        });
    };

    /**
     * listAccents
     *
     * Render the HTML for our accent colors.
     *
     * @memberof Preferences
     * @since 1.0.0
     */
    listAccents = () => {
        return this.preferences.accents.map((accent) => (
            <div
                key={accent}
                className={`mdf-color ${this.state.accent === accent ? 'mdf-color--active' : ''} mdf-accent-${accent}`}
                onClick={() => this.setAccent(accent)}
            ></div>
        ));
    };

    /**
     * listGradients
     *
     * Render the HTML for our gradients.
     *
     * @memberof Preferences
     * @since 1.0.0
     */
    listGradients = () => {
        return this.preferences.gradients.map((gradient) => (
            <div
                key={gradient}
                className={`mdf-color ${
                    this.state.gradient === gradient ? 'mdf-color--active' : ''
                } mdf-gradient-${gradient}`}
                onClick={() => this.setGradient(gradient)}
            ></div>
        ));
    };

    render() {
        return (
            <div className="mdf-slide">
                <header className="mdf-slide__header">
                    <div className="mdf-slide__controls">
                        <button
                            className="mdf-button mdf-button--icon"
                            aria-label="Return to the previous page"
                            onClick={this.props.onBack}
                        >
                            <svg className="mdf-icon mdf-rotate-180" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#arrow-keyboard`} />
                            </svg>
                        </button>
                    </div>

                    <h2 className="mdf-slide__title">
                        Change your <strong>preferences.</strong>
                    </h2>
                </header>

                <main className="mdf-slide__main">
                    <div className="mdf-slide__content">
                        <div id="accents" className="mdf-group">
                            <div className="mdf-group__header">
                                <h6 className="mdf-group__title">Accents</h6>
                                <p className="mdf-group__description">
                                    Choose the color that is applied to things like emphasis text, buttons, icons or
                                    text inputs.
                                </p>
                            </div>

                            <div className="mdf-group__grid">{this.listAccents()}</div>
                        </div>

                        <div id="gradients" className="mdf-group">
                            <div className="mdf-group__header">
                                <h6 className="mdf-group__title">Gradients</h6>
                                <p className="mdf-group__description">
                                    Choose one of these stunning gradients as your app's background color.
                                </p>
                            </div>

                            <div className="mdf-group__grid">{this.listGradients()}</div>
                        </div>

                        <div id="theme" className="mdf-group">
                            <div className="mdf-group__header">
                                <h6 className="mdf-group__title">Theme</h6>
                                <p className="mdf-group__description">
                                    Toggle dark mode if you're a night owl or simply like darker colors.
                                </p>
                            </div>

                            <div className="mdf-group__grid">
                                <div className="mdf-control">
                                    <div className="mdf-switch">
                                        <input
                                            id="theme-switch"
                                            className="mdf-switch__input"
                                            type="checkbox"
                                            role="switch"
                                            checked={this.state.useDarkTheme}
                                            onChange={($event) => this.toggleTheme($event)}
                                        />

                                        <div className="mdf-switch__track"></div>
                                        <div className="mdf-switch__thumb"></div>
                                        <div className="mdf-switch__shadow"></div>
                                    </div>

                                    <label htmlFor="theme-switch">Enable dark mode</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mdf-slide__footer"></footer>
            </div>
        );
    }

    componentDidMount() {
        // Get the app container element.
        this.appContainer = document.querySelector('.mdf-app')!;

        // Save the initial preferences to our state.
        this.applyPreferences();
    }
}
