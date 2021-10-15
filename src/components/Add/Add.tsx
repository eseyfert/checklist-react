import React from 'react';
import Checklist from '../Checklist/Checklist';
import Storage from '../../storage';
import { ChecklistData } from '../../types';

import './Add.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface AddProps {
    onBack: () => void;
    onRefresh: (data: ChecklistData) => void;
    onMessage: (message: string) => void;
}

const SELECTOR = {
    input: '.mdf-checklist-textfield .mdf-textfield__input',
};

/**
 * Add
 *
 * Displays the form to add a new checklist to storage.
 *
 * @export
 * @class Add
 * @extends {React.Component<AddProps>}
 * @version 1.0.0
 */
export default class Add extends React.Component<AddProps> {
    checklistRef: React.RefObject<Checklist> = React.createRef(); // Checklist instance ref.
    storage = new Storage('checklist'); // localStorage wrapper to save the checklist.

    /**
     * generateUUID
     *
     * Generate unique id for our checklist.
     *
     * @memberof Add
     * @since 1.0.0
     */
    generateUUID = (): number => {
        // Set min and max values.
        const min = 0;
        const max = 8;

        // This will generate an Array holding different integers.
        const baseArray = window.crypto.getRandomValues(new Uint32Array(max));

        // We use this seed to pick a random number between the set min and the max range.
        const seed = Math.floor(Math.random() * (max - 1 - min) + min);

        // Select the UUID from the array.
        const uuid = baseArray[seed];

        // Return the UUID as an absolute value.
        return Math.abs(uuid + Date.now());
    };

    /**
     * saveChecklist
     *
     * Save the checklist to storage.
     * Requires at minimum the title and one task.
     *
     * @memberof Add
     * @since 1.0.0
     */
    saveChecklist = () => {
        // Get access to the current checklist instance.
        const checklist = this.checklistRef.current;

        // Make sure our checklist has a title.
        if (checklist?.title.length) {
            // Store all tasks in this array.
            const tasks: string[] = [];

            // Get all text inputs.
            const inputs: HTMLInputElement[] = Array.from(document.querySelectorAll(SELECTOR.input));

            // Push the available input values to our array.
            for (const input of inputs) {
                if (input.value.length) {
                    tasks.push(input.value);
                }
            }

            if (tasks.length) {
                // Generate unique ID for the checklist.
                const id = this.generateUUID();

                // Create object holding the new checklist data.
                const updateData: ChecklistData = {
                    complete: false,
                    done: [],
                    id: id,
                    tasks: tasks,
                    time: Date.now(),
                    title: checklist.title,
                };

                // Save the data to storage.
                this.storage.set(id.toString(), updateData).then(() => {
                    // Return to the Landing slide with the new data.
                    this.props.onRefresh(updateData);
                    this.props.onBack();

                    // Show a Snackbar message to the user.
                    this.props.onMessage('Checklist successfully added');
                });
            }
        }
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
                        Write your <span> </span>
                        <strong>checklist.</strong>
                    </h2>
                </header>

                <main className="mdf-slide__main">
                    <div className="mdf-slide__content">
                        <Checklist mode={'edit'} data={null} ref={this.checklistRef}></Checklist>
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <button className="mdf-button mdf-button--filled mdf-button--large" onClick={this.saveChecklist}>
                        Save checklist
                    </button>
                </footer>
            </div>
        );
    }
}
