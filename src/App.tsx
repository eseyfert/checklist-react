import React from 'react';
import PreferencesManager from './preferences.manager';
import Landing from './components/Landing/Landing';
import Slide from './Slide';
import SnackbarContext from './snackbar.provider';
import Snackbar from './components/Snackbar/Snackbar';
import Storage from './storage';
import { debounce } from './helpers';
import { ChecklistData } from './types';

import './App.scss';

type AppState = {
    activeSlide: string | null;
    landingData: ChecklistData[];
    messages: string[];
    slideData: ChecklistData | null;
};

/**
 * App
 *
 * @export
 * @class App
 * @extends {React.Component<{}, AppState>}
 * @version 1.0.0
 */
export default class App extends React.Component<{}, AppState> {
    appContainer: HTMLElement | null = null; // App container element.
    landingActive: boolean = true; // Whether the Landing is currently visible.
    landingData: ChecklistData[] = []; // Checklist data for the Landing slide.
    slidesContainer: HTMLElement | null = null; // Slides container element.
    slideWidth: number = 0; // Holds the slide width for further calculations.
    storage: Storage = new Storage('checklist'); // Manages localStorage.
    styles: CSSStyleDeclaration | null = null; // Holds the slides CSS styles.

    state = { activeSlide: null, landingData: [], messages: [], slideData: null };

    /**
     * openSlide
     *
     * Open the given slide with the supplied data.
     *
     * @param {string} name Slide name
     * @param {(ChecklistData | null)} [data=null] Slide data
     * @memberof App
     * @since 1.0.0
     */
    openSlide = (name: string, data: ChecklistData | null = null) => {
        // Update our state with the active slide and its data.
        this.setState({ activeSlide: name, slideData: data });

        // Show the newly created slide.
        this.slideLeft();
    };

    /**
     * getLandingData
     *
     * Retrieve the Landing data from localStorage.
     *
     * @memberof App
     * @since 1.0.0
     */
    getLandingData = () => {
        // We make sure to reset the array for each call.
        this.landingData = [];

        // Find all keys in storage.
        this.storage.keys().then((keys) => {
            if (keys && keys.length) {
                // Loop over each available key.
                for (const key of keys) {
                    // Use each key to look up its value.
                    this.storage
                        .get(key)
                        .then((data) => {
                            // Push the found checklist data to our array.
                            this.landingData.push(data as ChecklistData);
                        })
                        .then(() => {
                            // Update the state Landing data.
                            this.setState({
                                landingData: this.landingData,
                            });
                        });
                }
            } else {
                // This simply resets the Landing data as the array will be empty.
                this.setState({
                    landingData: this.landingData,
                });
            }
        });
    };

    /**
     * updateLandingData
     *
     * Update the Landing data with the supplied data or simply refresh it.
     *
     * @param {ChecklistData} [data] Updated data for Landing, if empty calls for refresh
     * @memberof App
     * @since 1.0.0
     */
    updateLandingData = (data?: ChecklistData) => {
        if (data) {
            // Create new array holding the current data.
            const currentData = this.state.landingData as ChecklistData[];

            // See if the current data already exists in the array.
            const index = currentData.findIndex((current) => current.id === data.id);

            if (currentData[index]) {
                // Overwrite the existing data.
                currentData.splice(index, 1, data);
            } else {
                // Add the new data.
                currentData.push(data);
            }

            // Update our state Landing data.
            this.setState({
                landingData: currentData,
            });
        } else {
            // If no update data is present, refresh existing data.
            this.getLandingData();
        }
    };

    /**
     * showMessage
     *
     * Add the given message to the messages call stack.
     * Each message is passed to the Snackbar.Provider which then shows the message through the Snackbar component.
     *
     * @param {string} message The message to display
     * @memberof App
     * @since 1.0.0
     */
    showMessage = (message: string) => {
        // Add the supplied message to the existing messages stack.
        const messages = this.state.messages as string[];
        messages.push(message);

        // Update the state.
        this.setState({
            messages: messages,
        });
    };

    /**
     * removeMessage
     *
     * Remove the first message in order from the messages call stack.
     * Avoids the repeated showing of messages.
     *
     * @memberof App
     * @since 1.0.0
     */
    removeMessage = () => {
        // Remove the first message in order from the messages stack.
        const messages = this.state.messages as string[];
        messages.shift();

        // Update the state.
        this.setState({
            messages: messages,
        });
    };

    /**
     * calcWidth
     *
     * Calculate the width of a Slide element.
     * This number is used to move the Slides later.
     *
     * @memberof App
     * @since 1.0.0
     */
    calcWidth = () => {
        if (this.slidesContainer) {
            // Get the CSS properties for the first slide.
            this.styles = window.getComputedStyle(this.slidesContainer.firstElementChild!);

            // Calculate the proper width.
            this.slideWidth = parseFloat(this.styles.width) + parseFloat(this.styles.marginRight);

            // Make sure to properly position the currently displayed slide.
            if (this.slidesContainer.style.transform.includes('-')) {
                this.slidesContainer.style.transform = `translateX(-${this.slideWidth}px)`;
            }
        }
    };

    /**
     * slideLeft
     *
     * Move all slides to the left.
     *
     * @memberof App
     * @since 1.0.0
     */
    slideLeft = () => {
        this.slidesContainer!.style.transform = `translateX(-${this.slideWidth}px)`;
    };

    /**
     * slideRight
     *
     * Move all slides to the right.
     *
     * @memberof App
     */
    slideRight = () => {
        this.slidesContainer!.style.transform = 'translateX(0px)';
    };

    /**
     * goForward
     *
     * Called to show the newly introduced Slide.
     *
     * @memberof App
     * @since 1.0.0
     */
    goForward = () => {
        // Move forward, away from the Landing slide.
        this.slideLeft();

        // Indicate that the Landing is not visible.
        this.landingActive = false;
    };

    /**
     * goBack
     *
     * Called to return to the Landing slide.
     *
     * @memberof App
     * @since 1.0.0
     */
    goBack = () => {
        // Move back to the Landing slide.
        this.slideRight();

        // Indicate the Landing is visible.
        this.landingActive = true;

        // Update the state after the slide transition is done.
        setTimeout(() => this.setState({ activeSlide: null }), 360);
    };

    render() {
        return (
            <div className="mdf-app">
                <div className="mdf-app-content">
                    <div id="slides" className="mdf-slides" aria-live="polite">
                        <Landing
                            data={this.state.landingData}
                            onSlideChange={this.openSlide}
                            onRefresh={this.updateLandingData}
                            onMessage={this.showMessage}
                        />
                        <Slide
                            name={this.state.activeSlide}
                            data={this.state.slideData}
                            onBack={this.goBack}
                            onRefresh={this.updateLandingData}
                            onMessage={this.showMessage}
                        />
                    </div>
                </div>

                <SnackbarContext.Provider value={this.state.messages}>
                    <Snackbar onDispatch={this.removeMessage} />
                </SnackbarContext.Provider>
            </div>
        );
    }

    componentDidMount() {
        // Store references to the app and slides container elements.
        this.appContainer = document.querySelector('.mdf-app');
        this.slidesContainer = document.querySelector('.mdf-slides');

        // Apply user preferences.
        new PreferencesManager().applyPreferences();

        // Calculate the needed slides width.
        this.calcWidth();

        // Re-calculate slide width on window resize.
        window.onresize = debounce(() => this.calcWidth(), 60);

        // Get the initial data set for the Landing slide.
        this.getLandingData();
    }
}
