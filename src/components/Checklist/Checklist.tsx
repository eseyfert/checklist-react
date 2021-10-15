import React, { ChangeEvent } from 'react';
import Input from './Input';
import Storage from '../../storage';
import dayjs from 'dayjs';
import { ChecklistData } from '../../types';

import './Checklist.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface ChecklistProps {
    data: ChecklistData | null;
    mode: string;
}

interface ChecklistState {
    data: ChecklistData | null;
    inputElements: JSX.Element[];
    titleTouched: boolean;
}

/**
 * Checklist
 *
 * Creates the template and functionality for our Add, Edit, and View slides.
 *
 * @export
 * @class Checklist
 * @extends {React.Component<ChecklistProps, ChecklistState>}
 * @version 1.0.0
 */
export default class Checklist extends React.Component<ChecklistProps, ChecklistState> {
    addTaskRef: React.RefObject<HTMLButtonElement> = React.createRef(); // Ref to the `Add task` button
    createdInputs: number = 0; // # of created inputs.
    inputElements: JSX.Element[] = []; // Array of created input components.
    storage = new Storage('checklist'); // localStorage wrapper to save any changes made.
    title = ''; // Holds the checklist title.
    titleRef: React.RefObject<HTMLInputElement> = React.createRef(); // Ref for the checklist input.

    state = { data: null, inputElements: [], titleTouched: false };

    constructor(props: ChecklistProps) {
        super(props);

        // Check if we have checklist data available.
        if (this.props.data) {
            // Set the checklist title.
            this.title = this.props.data.title;
        }
    }

    /**
     * updateTitle
     *
     * Update the checklist title.
     * Sets the touched flag when changed for the first time.
     *
     * @param {ChangeEvent<HTMLInputElement>} $event
     * @memberof Checklist
     * @since 1.0.0
     */
    updateTitle = ($event: ChangeEvent<HTMLInputElement>) => {
        if (!this.state.titleTouched) {
            this.setState({ titleTouched: true });
        }

        this.title = ($event.target as HTMLInputElement).value;
    };

    /**
     * titleHasError
     *
     * Returns whether the title is faulty.
     *
     * @memberof Checklist
     * @since 1.0.0
     */
    titleHasError = (): boolean => {
        return this.state.titleTouched && !this.title.length;
    };

    /**
     * createInput
     *
     * Add new, blank input to the DOM.
     *
     * @param {boolean} [focus=true] Whether to autofocus the input
     * @memberof Checklist
     * @since 1.0.0
     */
    createInput = (focus: boolean = true) => {
        // Store the current state inputs.
        this.inputElements = this.state.inputElements;

        // Update the inputs counter.
        this.createdInputs++;

        // Add new element to state inputs with necessary attributes.
        this.setState({
            inputElements: this.inputElements.concat(
                <Input
                    key={this.createdInputs}
                    id={this.createdInputs}
                    mode={this.props.mode}
                    focus={focus}
                    isRemovable={true}
                    onRemove={this.removeInput}
                ></Input>
            ),
        });
    };

    /**
     * insertInputs
     *
     * Loop over any existing tasks data we have and insert the required input elements.
     *
     * @memberof Checklist
     * @since 1.0.0
     */
    insertInputs = () => {
        // Make sure we have data first.
        if (this.props.data) {
            // We use this.
            this.inputElements = [];

            // Loop over the tasks in the data set.
            for (const task of this.props.data.tasks) {
                // Update the inputs counter.
                this.createdInputs++;

                // Add an input element for every task.
                this.inputElements.push(
                    <Input
                        key={this.createdInputs}
                        id={this.createdInputs}
                        value={task}
                        mode={this.props.mode}
                        focus={false}
                        checked={this.isComplete(task)}
                        isRemovable={this.props.mode === 'edit' ? true : false}
                        onRemove={this.removeInput}
                        onComplete={this.completeTask}
                    ></Input>
                );
            }

            // Update the state inputs.
            this.setState({
                inputElements: this.inputElements,
            });
        }
    };

    /**
     * isComplete
     *
     * Whether or not the given task is complete.
     *
     * @param {string} task The task to check for
     * @memberof Checklist
     * @since 1.0.0
     */
    isComplete = (task: string): boolean => {
        // Default task completion state is false.
        let isComplete = false;

        if (this.props.data) {
            // Change boolean to true if the task is done.
            if (this.props.data.done.includes(task)) {
                isComplete = true;
            }
        }

        return isComplete;
    };

    /**
     * removeInput
     *
     * Remove the given input from the DOM and update our state values.
     *
     * @param {number} id The id of the input we are removing
     * @param {string} task The task assigned to the input
     * @memberof Checklist
     * @since 1.0.0
     */
    removeInput = (id: number, task: string) => {
        // Store the current set of inputs.
        this.inputElements = this.state.inputElements;

        // Continue if we have more than one input.
        if (this.inputElements.length > 1) {
            // Remove the given element from our set of inputs.
            this.inputElements = this.inputElements.filter((elem) => {
                return elem.props.id !== id;
            });

            // Update the state data.
            this.setState({
                inputElements: this.inputElements,
            });

            // Update counter.
            this.createdInputs--;

            // Make sure the count does not drop below 1.
            if (this.createdInputs < 1) {
                this.createdInputs = 1;
            }

            // Set focus to the `Add task` button.
            this.focusAddButton();

            if (this.state.data) {
                // Get the current state data.
                const currentData = this.state.data as ChecklistData;

                // Check if the input we are removing belongs to a completed task.
                if (currentData.done.includes(task)) {
                    // Remove the task from the array.
                    const index = currentData.done.indexOf(task);
                    currentData.done.splice(index, 1);

                    // Update the state data.
                    this.setState({
                        data: currentData,
                    });
                }
            }
        }
    };

    /**
     * completeTask
     *
     * Marks the given task as complete or incomplete on repeated calls.
     *
     * @param {string} task The task to check for
     * @memberof Checklist
     * @since 1.0.0
     */
    completeTask = (task: string) => {
        if (this.state.data) {
            // Get the state data.
            const currentData = this.state.data as ChecklistData;

            // Store the completed tasks so far.
            const completedTasks = currentData.done;

            // Get the index of the current task.
            const index = completedTasks.findIndex((value) => value === task);

            if (completedTasks[index]) {
                // If the tasks is already complete, remove it from the array.
                completedTasks.splice(index, 1);
            } else {
                // Otherwise add it.
                completedTasks.push(task);
            }

            // Overwrite the completed tasks in our checklist data.
            currentData.done = completedTasks;

            // Save the new data to storage.
            this.storage.set(currentData.id.toString(), currentData).then(() => {
                // Update the state data.
                this.setState({
                    data: currentData,
                });
            });
        }
    };

    /**
     * focusAddButton
     *
     * Focus the `Add task` button.
     *
     * @memberof Checklist
     * @since 1.0.0
     */
    focusAddButton = () => {
        this.addTaskRef.current!.focus();
    };

    /**
     * date
     *
     * Convert timestamp to date string showing month, day and year.
     *
     * @param {number} time The timestamp to convert
     * @memberof Checklist
     * @since 1.0.0
     */
    date = (time: number): string => {
        return dayjs(time).format('MMM, DD YYYY');
    };

    /**
     * time
     *
     * Convert timestamp to date string showing hours:minutes and AM/PM indicator.
     *
     * @param {number} time The timestamp to convert
     * @memberof Checklist
     * @since 1.0.0
     */
    time = (time: number): string => {
        return dayjs(time).format('H:mm A');
    };

    /**
     * editTemplate
     *
     * Template for the `edit` mode of our checklist.
     * Allows for the editing of the title and tasks.
     *
     * @memberof Checklist
     * @since 1.0.0
     */
    editTemplate = () => {
        return (
            <div className="mdf-group mdf-group--stacked">
                <div
                    className={`mdf-textfield mdf-textfield--has-helper ${
                        this.titleHasError() ? 'mdf-textfield--state-error' : ''
                    }`}
                >
                    <input
                        ref={this.titleRef}
                        className="mdf-textfield__input"
                        id="checklist-title"
                        type="text"
                        name="title"
                        placeholder="Enter checklist title..."
                        defaultValue={this.props.data?.title}
                        required
                        onChange={($event) => this.updateTitle($event)}
                    />

                    {this.titleHasError() && (
                        <div className="mdf-textfield__helper-line">
                            <span className="mdf-textfield__helper">The title can't be empty</span>
                        </div>
                    )}
                </div>

                {this.state.inputElements}

                <button
                    ref={this.addTaskRef}
                    id="add-input"
                    className="mdf-button mdf-button--filled mdf-button--leading-icon"
                    onClick={() => this.createInput(true)}
                >
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#add`}></use>
                    </svg>
                    Add another task
                </button>
            </div>
        );
    };

    /**
     * viewTemplate
     *
     * Template for the `view` mode of our checklist.
     * The title is no longer editable and changes the text inputs to checkboxes.
     *
     * @memberof Checklist
     * @since 1.0.0
     */
    viewTemplate = () => {
        return (
            <div className="mdf-group mdf-group--stacked">
                <div className="mdf-checklist-header">
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#checklist`}></use>
                    </svg>

                    <div className="mdf-checklist-header__content">
                        <h6 className="mdf-checklist-header__title">{this.props.data!.title}</h6>

                        {this.state.data && (
                            <span className="mdf-checklist-header__meta">
                                Created {this.date(this.props.data!.time)} at {this.time(this.props.data!.time)} &mdash;{' '}
                                Tasks left:{' '}
                                {(this.state.data as ChecklistData).tasks.length -
                                    (this.state.data as ChecklistData).done.length}
                            </span>
                        )}
                    </div>
                </div>

                <ul className="mdf-checklist">{this.state.inputElements}</ul>
            </div>
        );
    };

    render() {
        return this.props.mode === 'edit' ? this.editTemplate() : this.viewTemplate();
    }

    componentDidMount() {
        // Continue if we're viewing the `Edit` template.
        if (this.props.mode === 'edit') {
            // Set focus on the title input.
            setTimeout(() => this.titleRef.current!.focus(), 360);
        }

        // Check if we have checklist data available.
        if (this.props.data) {
            // Update the data state.
            this.setState({
                data: this.props.data,
            });

            // Create inputs for the available data.
            this.insertInputs();
        } else {
            // If we have no data, create a starting input.
            this.createInput(false);
        }
    }
}
