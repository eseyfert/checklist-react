import React from 'react';
import Preferences from './components/Preferences/Preferences';
import Add from './components/Add/Add';
import Edit from './components/Edit/Edit';
import View from './components/View/View';
import { ChecklistData } from './types';

type SlideProps = {
    data: ChecklistData | null;
    name: string | null;
    onBack: () => void;
    onRefresh: (data?: ChecklistData) => void;
    onMessage: (message: string) => void;
};

/**
 * Slide
 *
 * Handle creating the given Slide component and managing its data.
 *
 * @export
 * @class Slide
 * @extends {React.Component<SlideProps>}
 * @version 1.0.0
 */
export default class Slide extends React.Component<SlideProps> {
    // Holds the available Slide components.
    components: Record<string, React.ElementType> = {
        preferences: Preferences,
        add: Add,
        edit: Edit,
        view: View,
    };

    /**
     * goBack
     *
     * Return to the Landing slide.
     *
     * @memberof Slide
     * @since 1.0.0
     */
    goBack = () => {
        this.props.onBack();
    };

    /**
     * refresh
     *
     * Refresh the Landing slide data.
     *
     * @param {ChecklistData} [data] Updated data for Landing, if empty calls for refresh
     * @memberof Slide
     * @since 1.0.0
     */
    refresh = (data?: ChecklistData) => {
        if (data) {
            this.props.onRefresh(data);
        } else {
            this.props.onRefresh();
        }
    };

    /**
     * catchMessage
     *
     * Catches message and forwards it to the Snackbar provider.
     *
     * @param {string} message The message to forward
     * @memberof Slide
     * @since 1.0.0
     */
    catchMessage = (message: string) => {
        this.props.onMessage(message);
    };

    render() {
        if (this.props.name && this.props.name.length) {
            const SlideComponent = this.components[this.props.name];
            return (
                <SlideComponent
                    data={this.props.data}
                    onBack={this.goBack}
                    onRefresh={this.refresh}
                    onMessage={this.catchMessage}
                />
            );
        }
        return null;
    }
}
