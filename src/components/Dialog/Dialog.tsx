import React from 'react';
import ReactDOM from 'react-dom';
import { getScrollbarParent } from '../../helpers';

import './Dialog.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface DialogProps {
    description: string;
    keyboard?: boolean;
    title: string;
    onCancel?: () => void;
    onConfirm?: () => void;
}

const CLASS = {
    active: 'mdf-dialog-container--active',
    disableScrollbar: 'mdf-scrollbar-hidden',
    fadeIn: 'mdf-dialog-container--fade-in',
    transition: 'mdf-dialog--transition',
};

const SELECTOR = {
    container: '.mdf-dialog-container',
    focus: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe:not([tabindex^="-"]), [tabindex]:not([tabindex^="-"])',
};

/**
 * Dialog
 *
 * Displays a modal dialog window the user.
 * The dialog has a title, description and offers two actions: `cancel` and `confirm`.
 *
 * @export
 * @class Dialog
 * @extends {React.Component<DialogProps>}
 * @version 1.0.0
 */
export default class Dialog extends React.Component<DialogProps> {
    containerRef: React.RefObject<HTMLDivElement> = React.createRef(); // Ref to the container element.
    dialogRef: React.RefObject<HTMLDivElement> = React.createRef(); // Ref to the dialog element.
    focusableElements!: HTMLElement[]; // Array of focusable elements inside the dialog.
    focusIndex: number = 0; // Index of the current element in focus.
    lastActiveElement!: HTMLElement; // Holds the last focused element before the dialog was opened.
    scrollbarParent!: HTMLElement; // Holds the first parent element that has overflowing content.

    /**
     * open
     *
     * Shows the dialog window to the user.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    open = () => {
        if (this.containerRef.current && this.dialogRef.current) {
            // Activate the dialog container without making it visible yet.
            this.containerRef.current.classList.add(CLASS.active);

            // Store the last active element before we opened the dialog.
            this.lastActiveElement = document.activeElement as HTMLElement;

            // Look for the first parent element that has overflowing content.
            this.scrollbarParent = getScrollbarParent(this.containerRef.current, SELECTOR.container);

            // Fade-in the dialog element once the container is ready.
            setTimeout(() => {
                this.containerRef.current!.classList.add(CLASS.fadeIn);
            }, 60);

            // Temporarily disable scrolling for the scrollbar parent.
            this.scrollbarParent.classList.add(CLASS.disableScrollbar);

            // Start the dialog animation.
            this.dialogRef.current.classList.add(CLASS.transition);

            // After the animation is done playing, we remove the class to avoid repeats.
            this.dialogRef.current.addEventListener('animationend', () =>
                this.dialogRef.current?.classList.remove(CLASS.transition)
            );

            // Continue if keyboard support is required.
            if (this.props.keyboard) {
                // Set focus to the first focusable element in the dialog.
                this.focusableElements[0].focus();

                // Add keyboard events.
                this.containerRef.current.addEventListener('keydown', this.keyboardEvents);
            }
        }
    };

    /**
     * close
     *
     * Close the dialog window.
     * Used for both `cancel` and `confirm` actions.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    close = () => {
        if (this.containerRef.current) {
            // Fade-out the container without deactivating it yet.
            this.containerRef.current.classList.remove(CLASS.fadeIn);

            const afterFadeOut = () => {
                // Deactivate the dialog.
                this.containerRef.current!.classList.remove(CLASS.active);

                // Enable scrolling again for the scrollbar parent.
                this.scrollbarParent.classList.remove(CLASS.disableScrollbar);

                // Set focus on the last active element.
                if (this.props.keyboard) {
                    this.lastActiveElement.focus();
                }

                // Remove event listener to avoid repeat calls.
                this.containerRef.current!.removeEventListener('transitionend', afterFadeOut);
            };

            // Add the `transitionend` event to know when the fade-out is complete.
            this.containerRef.current.addEventListener('transitionend', afterFadeOut);
        }
    };

    /**
     * cancel
     *
     * Execute the cancel action and close the dialog window.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    cancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }

        this.close();
    };

    /**
     * confirm
     *
     * Execute the confirm action and close the dialog window.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    confirm = () => {
        if (this.props.onConfirm) {
            this.props.onConfirm();
        }

        this.close();
    };

    /**
     * setFocusOnElem
     *
     * Set focus on the given element.
     *
     * @param {number} index Index of the element to focus
     * @memberof Dialog
     * @since 1.0.0
     */
    setFocusOnElem = (index: number) => {
        this.focusableElements[index].focus();
    };

    /**
     * focusPreviousElem
     *
     * Move focus to the previous element in line.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    focusPreviousElem = () => {
        if (this.focusIndex >= 1) {
            // Move to the previous element.
            this.focusIndex--;
        } else if (this.focusIndex === 0) {
            // If we are on the first element, wrap back around to the last element.
            this.focusIndex = this.focusableElements.length - 1;
        }
        // We move the focus to the previous element.
        this.setFocusOnElem(this.focusIndex);
    };

    /**
     * focusNextElem
     *
     * Move focus to the next element in line.
     *
     * @memberof Dialog
     * @since 1.0.0
     */
    focusNextElem = () => {
        if (this.focusIndex === this.focusableElements.length - 1) {
            // If we are on the last element, wrap back around to the first element.
            this.focusIndex = 0;
        } else if (this.focusIndex >= 0) {
            // Move to the next element.
            this.focusIndex++;
        }
        // We move the focus to the next element.
        this.setFocusOnElem(this.focusIndex);
    };

    /**
     * keyboardEvents
     *
     * Handle keyboard navigation inside the dialog.
     *
     * @param {KeyboardEvent} $event
     * @memberof Dialog
     * @since 1.0.0
     */
    keyboardEvents = ($event: KeyboardEvent) => {
        if ($event.key === 'Tab' && $event.shiftKey) {
            // Tab backwards, focus the previous element.
            $event.preventDefault();
            this.focusPreviousElem();
        } else if ($event.key === 'Tab') {
            // Tab forwards, focus the next element.
            $event.preventDefault();
            this.focusNextElem();
        } else if ($event.key === 'Escape') {
            // Escape cancels the dialog.
            $event.preventDefault();
            this.cancel();
        }
    };

    render() {
        return ReactDOM.createPortal(
            <div ref={this.containerRef} className="mdf-dialog-container" aria-hidden="false" aria-modal="true">
                <div
                    ref={this.dialogRef}
                    className="mdf-dialog"
                    role="dialog"
                    aria-labelledby="dialog-title"
                    aria-describedby="dialog-desc"
                >
                    <div className="mdf-dialog__header">
                        <h2 id="dialog-title" className="mdf-dialog__title">
                            {this.props.title}
                        </h2>

                        <button className="mdf-dialog__close" aria-label="Close dialog" onClick={this.cancel}>
                            <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#clear`}></use>
                            </svg>
                        </button>
                    </div>

                    <div className="mdf-dialog__content">
                        <p id="dialog-desc">{this.props.description}</p>
                    </div>

                    <div className="mdf-dialog__actions">
                        <button className="mdf-button" onClick={this.cancel}>
                            Cancel
                        </button>

                        <button className="mdf-button" onClick={this.confirm}>
                            Confirm
                        </button>
                    </div>
                </div>

                <div className="mdf-dialog-backdrop" onClick={this.cancel}></div>
            </div>,
            document.getElementById('dialog')!
        );
    }

    componentDidMount() {
        if (this.containerRef.current) {
            // Create a list of all focusable elements INSIDE the dialog.
            this.focusableElements = Array.from(this.containerRef.current.querySelectorAll(SELECTOR.focus));

            // Show the dialog.
            this.open();
        }
    }

    componentWillUnmount() {
        // Remove keyboard events.
        if (this.props.keyboard) {
            this.containerRef.current!.removeEventListener('keydown', this.keyboardEvents);
        }
    }
}
