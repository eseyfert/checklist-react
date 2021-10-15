import React, { ChangeEvent } from 'react';
import './Input.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface InputProps {
    checked?: boolean;
    done?: boolean;
    focus: boolean;
    id: number;
    isRemovable: boolean;
    mode: string;
    onComplete?: (task: string) => void;
    onRemove?: (index: number, task: string) => void;
    value?: string;
}

interface InputState {
    checked: boolean;
    value: string;
}

/**
 * Input
 *
 * Create Input component for the Add/Edit and View checklist templates.
 *
 * @export
 * @class Input
 * @extends {React.Component<InputProps, InputState>}
 * @version 1.0.0
 */
export default class Input extends React.Component<InputProps, InputState> {
    inputRef: React.RefObject<HTMLInputElement> = React.createRef(); // Ref to the input element.

    state = { checked: false, value: '' };

    /**
     * updateChecked
     *
     * Update checked state of checkbox input in state.
     *
     * @param {ChangeEvent<HTMLInputElement>} $event
     * @memberof Input
     * @since 1.0.0
     */
    updateChecked = ($event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            checked: ($event.target as HTMLInputElement).checked,
        });
    };

    /**
     * updateValue
     *
     * Update value of text input in state.
     *
     * @param {ChangeEvent<HTMLInputElement>} $event
     * @memberof Input
     * @since 1.0.0
     */
    updateValue = ($event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            value: ($event.target as HTMLInputElement).value,
        });
    };

    /**
     * completeTask
     *
     * Send task completion data to Checklist parent.
     *
     * @memberof Input
     * @since 1.0.0
     */
    completeTask = () => {
        if (this.props.onComplete && this.props.value) {
            this.props.onComplete(this.props.value);
        }
    };

    /**
     * removeInput
     *
     * Send request to remove current input from Checklist parent.
     *
     * @memberof Input
     * @since 1.0.0
     */
    removeInput = () => {
        if (this.props.onRemove) {
            this.props.onRemove(this.props.id, this.state.value);
        }
    };

    /**
     * editTemplate
     *
     * Renders the HTML for the Add/Edit style input.
     *
     * @memberof Input
     * @since 1.0.0
     */
    editTemplate = () => {
        return (
            <div className="mdf-checklist-textfield mdf-textfield">
                <input
                    ref={this.inputRef}
                    className="mdf-textfield__input"
                    type="text"
                    name={`task-${this.props.id + 1}`}
                    placeholder="Enter your task..."
                    defaultValue={this.props.value}
                    onChange={($event) => this.updateValue($event)}
                ></input>

                {this.props.isRemovable && this.deleteButton()}
            </div>
        );
    };

    /**
     * viewTemplate
     *
     * Renders the HTML for the View style input.
     *
     * @memberof Input
     * @since 1.0.0
     */
    viewTemplate = () => {
        return (
            <li className="mdf-checklist__item">
                <div className="mdf-control">
                    <div className="mdf-checkbox">
                        <input
                            id={`checkbox-${this.props.id + 1}`}
                            className="mdf-checkbox__input"
                            type="checkbox"
                            defaultChecked={this.props.checked}
                            onInput={this.completeTask}
                            onChange={($event) => this.updateChecked($event)}
                        />

                        <div className="mdf-checkbox__box">
                            <svg className="mdf-checkbox__check" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#checkbox`}></use>
                            </svg>
                        </div>
                    </div>

                    <label htmlFor={`checkbox-${this.props.id + 1}`} className={this.state.checked ? 'done' : ''}>
                        {this.props.value}
                    </label>
                </div>
            </li>
        );
    };

    /**
     * deleteButton
     *
     * Renders the HTML for the `Remove task` button.
     *
     * @memberof Input
     * @since 1.0.0
     */
    deleteButton = () => {
        return (
            <button className="mdf-button mdf-button--icon" aria-label="Remove task" onClick={this.removeInput}>
                <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${Icons}#delete`}></use>
                </svg>
            </button>
        );
    };

    render() {
        return this.props.mode === 'edit' ? this.editTemplate() : this.viewTemplate();
    }

    componentDidMount() {
        // If passed, save checked boolean value to state.
        if (this.props.checked) {
            this.setState({
                checked: true,
            });
        }

        // If passed, save input text value to state.
        if (this.props.value) {
            this.setState({
                value: this.props.value,
            });
        }

        // If needed, focus the input element on creation.
        if (this.props.focus) {
            this.inputRef.current?.focus();
        }
    }
}
