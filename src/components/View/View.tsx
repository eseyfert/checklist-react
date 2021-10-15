import React from 'react';
import Checklist from '../Checklist/Checklist';
import Storage from '../../storage';
import { ChecklistData } from '../../types';

import './View.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface ViewProps {
    data: ChecklistData;
    onBack: () => void;
    onRefresh: (data: ChecklistData) => void;
    onMessage: (message: string) => void;
}

/**
 * View
 *
 * Displays the checklist and allows the user to mark individual tasks as complete or set the entire list as complete.
 *
 * @export
 * @class View
 * @extends {React.Component<ViewProps>}
 * @version 1.0.0
 */
export default class View extends React.Component<ViewProps> {
    checklistRef: React.RefObject<Checklist> = React.createRef(); // Ref to the current checklist instance.

    storage = new Storage('checklist'); // localStorage wrapper to save any changes made.

    /**
     * setAsComplete
     *
     * Set the checklist as complete and return to the Landing slide.
     *
     * @memberof View
     * @since 1.0.0
     */
    setAsComplete = () => {
        // Get the current checklist data set.
        const currentData = this.props.data;

        // Create object holding the updated checklist data.
        const updateData: ChecklistData = Object.assign({}, this.props.data, {
            complete: true,
            done: this.props.data.tasks,
        });

        // Save the data to storage.
        this.storage.set(currentData.id.toString(), updateData).then(() => {
            // Update the Landing slide data with our changes.
            this.props.onRefresh(updateData);

            // Return to the Landing slide.
            this.props.onBack();

            // Display a message to the user.
            this.props.onMessage('Checklist set as complete');
        });
    };

    render() {
        return (
            <div className="mdf-slide">
                <header className="mdf-slide__header">
                    <div className="mdf-slide__controls">
                        <button
                            id="show-options"
                            className="mdf-button mdf-button--icon"
                            aria-label="Return to the previous page"
                            onClick={this.props.onBack}
                        >
                            <svg className="mdf-icon mdf-rotate-180" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#arrow-keyboard`}></use>
                            </svg>
                        </button>
                    </div>

                    <h2 className="mdf-slide__title">
                        View your <span> </span>
                        <strong>checklist.</strong>
                    </h2>
                </header>

                <main className="mdf-slide__main">
                    <div className="mdf-slide__content">
                        <Checklist mode={'view'} data={this.props.data} ref={this.checklistRef}></Checklist>
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <button className="mdf-button mdf-button--filled mdf-button--large" onClick={this.setAsComplete}>
                        Set as complete
                    </button>
                </footer>
            </div>
        );
    }
}
