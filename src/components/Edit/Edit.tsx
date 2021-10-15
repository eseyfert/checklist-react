import React from 'react';
import Checklist from '../Checklist/Checklist';
import Storage from '../../storage';
import Dialog from '../Dialog/Dialog';
import { ChecklistData } from '../../types';

import './Edit.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface EditProps {
    data: ChecklistData;
    onBack: () => void;
    onRefresh: (data?: ChecklistData) => void;
    onMessage: (message: string) => void;
}

interface EditState {
    dialogActive: boolean;
    dialogUseKeyboard: boolean;
}

const SELECTOR = {
    input: '.mdf-checklist-textfield .mdf-textfield__input',
};

/**
 * Edit
 *
 * Displays the form to edit an existing checklist and save the changes to storage or to remove it.
 *
 * @export
 * @class Edit
 * @extends {React.Component<EditProps, EditState>}
 * @version 1.0.0
 */
export default class Edit extends React.Component<EditProps, EditState> {
    checklistRef: React.RefObject<Checklist> = React.createRef(); // Ref to the current checklist instance.
    storage = new Storage('checklist'); // localStorage wrapper to save any changes made.

    state = { dialogActive: false, dialogUseKeyboard: false };

    /**
     * openDialog
     *
     * Open the `Remove checklist` dialog window.
     *
     * @memberof Edit
     * @since 1.0.0
     */
    openDialog = () => {
        this.setState({
            dialogActive: true,
            dialogUseKeyboard: false,
        });
    };

    /**
     * openKbDialog
     *
     * Open the `Remove checklist` dialog window with keyboard controls.
     *
     * @memberof Edit
     * @since 1.0.0
     */
    openKbDialog = ($event: React.KeyboardEvent<HTMLButtonElement>) => {
        if ($event.key === 'Enter' || $event.key === ' ') {
            $event.preventDefault();

            this.setState({
                dialogActive: true,
                dialogUseKeyboard: true,
            });
        }
    };

    /**
     * cancelDialog
     *
     * Close the dialog window.
     *
     * @memberof Edit
     * @since 1.0.0
     */
    cancelDialog = () => {
        this.setState({
            dialogActive: false,
        });
    };

    /**
     * deleteChecklist
     *
     * Delete the checklist from storage and return to the Landing slide.
     *
     * @memberof Edit
     * @since 1.0.0
     */
    deleteChecklist = () => {
        this.storage.delete(this.props.data.id.toString()).then(() => {
            // Hide the dialog.
            this.cancelDialog();

            // Request a total refresh of the Landing slide data.
            this.props.onRefresh();

            // Return to the Landing slide.
            this.props.onBack();

            // Display a message to the user.
            this.props.onMessage('Checklist successfully removed');
        });
    };

    /**
     * saveChanges
     *
     * Save the changes made to the checklist and return to the Landing slide.
     *
     * @memberof Edit
     * @since 1.0.0
     */
    saveChanges = () => {
        // Get the current checklist instance.
        const checklist = this.checklistRef.current;

        // Make sure we have a checklist title.
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
                // Get the current checklist data set.
                const currentData = this.props.data;

                // Create object holding the updated checklist data.
                const updateData = Object.assign({}, this.props.data, { tasks: tasks, title: checklist.title });

                // Save the data to storage.
                this.storage.set(currentData.id.toString(), updateData).then(() => {
                    // Update the Landing slide data with our changes.
                    this.props.onRefresh(updateData);

                    // Return to the Landing slide.
                    this.props.onBack();

                    // Display a message to the user.
                    this.props.onMessage('Changes successfully saved');
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
                        Edit your <span> </span>
                        <strong>checklist.</strong>
                    </h2>
                </header>

                <main className="mdf-slide__main">
                    <div className="mdf-slide__content">
                        <Checklist mode={'edit'} data={this.props.data} ref={this.checklistRef}></Checklist>
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <button
                        className="mdf-button mdf-button--filled mdf-button--large mdf-button--leading-icon"
                        onClick={this.saveChanges}
                    >
                        <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <use href={`${Icons}#done`}></use>
                        </svg>
                        Save changes
                    </button>

                    <button
                        className="mdf-button mdf-button--large mdf-button--leading-icon"
                        onClick={this.openDialog}
                        onKeyDown={($event) => this.openKbDialog($event)}
                    >
                        <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <use href={`${Icons}#delete`}></use>
                        </svg>
                        Delete checklist
                    </button>
                </footer>

                {this.state.dialogActive && (
                    <Dialog
                        title={'Remove checklist'}
                        description={'Are you sure you want to remove this checklist?'}
                        keyboard={this.state.dialogUseKeyboard}
                        onConfirm={this.deleteChecklist}
                        onCancel={this.cancelDialog}
                    />
                )}
            </div>
        );
    }
}
