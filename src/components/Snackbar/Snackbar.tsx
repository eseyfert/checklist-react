import React from 'react';
import ReactDOM from 'react-dom';
import SnackbarContext from '../../snackbar.provider';

import './Snackbar.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface SnackbarProps {
    onDispatch: () => void;
}

interface SnackbarState {
    active: boolean;
}

const ATTR = {
    live: 'aria-live',
    message: 'data-snackbar-message',
};

const CLASS = {
    active: 'mdf-snackbar--active',
};

/**
 * Snackbar
 *
 * Displays a message to the user at the bottom of the screen.
 *
 * @export
 * @class Snackbar
 * @extends {React.Component<SnackbarProps, SnackbarState>}
 * @version 1.0.0
 */
export default class Snackbar extends React.Component<SnackbarProps, SnackbarState> {
    static contextType = SnackbarContext; // Context from the Snackbar.Provider.
    context!: React.ContextType<typeof SnackbarContext>;

    containerRef: React.RefObject<HTMLDivElement> = React.createRef(); // Ref to the snackbar container element.
    textRef: React.RefObject<HTMLSpanElement> = React.createRef(); // Ref to the snackbar text element.

    delay: number = 5000; // Delay before hiding the message automatically (in ms).
    queue: string[] = []; // Messages queue.
    text: string = ''; // Current snackbar text.
    timeout: number = 0; // Timeout instance.

    state = { active: false };

    /**
     * showSnackbar
     *
     * Snow the snackbar with the given message.
     * Adds the message to the queue if a snackbar is already active.
     *
     * @param {string} message The message to display
     * @memberof Snackbar
     * @since 1.0.0
     */
    showSnackbar = (message: string) => {
        // If a snackbar is still active, add the message to the queue and don't continue.
        if (this.state.active) {
            // We fire the dispatch event to avoid the snackbar showing the same message repeatedly.
            this.props.onDispatch();

            // Push the message to our queue.
            this.queue.push(message);
            return;
        }

        // Clear the snackbar timeout id.
        clearTimeout(this.timeout);

        // Set snackbar message.
        this.text = message;
        this.textRef.current!.textContent = message;

        // Set the snackbar as `active`.
        this.setState({
            active: true,
        });

        // Let the script know the current message has been shown to the user.
        if (!this.queue.length) {
            this.props.onDispatch();
        }

        // Announce message to assistive technologies.
        this.announceSnackbar();

        // Show the snackbar element.
        this.containerRef.current!.classList.add(CLASS.active);

        // After a set delay, hide the snackbar element.
        this.timeout = window.setTimeout(() => this.hideSnackbar(), this.delay);
    };

    /**
     * announceSnackbar
     *
     * Announce the snackbar message to A11y technologies.
     *
     * @memberof Snackbar
     * @since 1.0.0
     */
    announceSnackbar = () => {
        // Don't continue if the snackbar is hidden.
        if (!this.state.active) return;

        // Set the `aria-live` attribute to `off` while we manipulate the element.
        this.containerRef.current!.setAttribute(ATTR.live, 'off');

        /**
         * Temporarily empty out the textContent to force the screen readers to detect a change.
         * Based on: https://github.com/material-components/material-components-web/commit/b4b19b720417bea5f211be1e37821ffb7a5c0759
         */
        this.textRef.current!.textContent = '';
        this.textRef.current!.innerHTML = '<span style="display: inline-block; width: 0; height: 1px;">&nbsp;</span>';

        // Temporarily display the message through the `::before` pseudo element while we reset the textContent.
        this.textRef.current!.setAttribute(ATTR.message, this.text);

        setTimeout(() => {
            // We change the `aria-live` attribute to `polite` so screen readers can announce the message.
            this.containerRef.current!.setAttribute(ATTR.live, 'polite');

            // Remove the `::before` text.
            this.textRef.current!.removeAttribute(ATTR.message);

            // Restore the original snackbar message to have the screen reader announce it.
            this.textRef.current!.textContent = this.text;
        }, 1000);
    };

    /**
     * displayNextMessage
     *
     * Show the next message in queue.
     *
     * @memberof Snackbar
     * @since 1.0.0
     */
    displayNextMessage = () => {
        // Queue is empty, don't continue.
        if (!this.queue.length) return;

        // Display next message.
        this.showSnackbar(this.queue.shift()!);
    };

    /**
     * hideSnackbar
     *
     * Hide the snackbar.
     * Either happens automatically after the set delay or by user input.
     *
     * @memberof Snackbar
     * @since 1.0.0
     */
    hideSnackbar = () => {
        // Hide the snackbar element.
        this.containerRef.current!.classList.remove(CLASS.active);

        // Function will fire as soon as the snackbar element transition has ended.
        const waitForTransition = () => {
            // Clear the snackbar timeout id.
            clearTimeout(this.timeout);

            // Set 'active' status to 'false'.
            this.setState({
                active: false,
            });

            // Show next message.
            this.displayNextMessage();

            // Remove 'transitionend' event from snackbar element.
            this.containerRef.current!.removeEventListener('transitionend', waitForTransition);
        };

        // Add 'transitionend' event to the snackbar element.
        this.containerRef.current!.addEventListener('transitionend', waitForTransition);
    };

    /**
     * keyboardEvents
     *
     * Allows the user to hide the snackbar by pressing `ESC`.
     *
     * @param {KeyboardEvent} evt
     * @memberof Snackbar
     * @since 1.0.0
     */
    keyboardEvents = (evt: KeyboardEvent) => {
        // Make sure the user pressed the `ESC` key.
        if (evt.key === 'Escape') {
            // If the snackbar is currently visible, hide it.
            if (this.state.active && this.containerRef.current) {
                evt.preventDefault();

                this.hideSnackbar();
            }
        }
    };

    render() {
        return ReactDOM.createPortal(
            <div ref={this.containerRef} className="mdf-snackbar" role="status" aria-live="polite">
                <span ref={this.textRef} className="mdf-snackbar__text"></span>

                <div className="mdf-snackbar__actions">
                    <button className="mdf-snackbar__close" aria-label="Dismiss snackbar" onClick={this.hideSnackbar}>
                        <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <use href={`${Icons}#clear`}></use>
                        </svg>
                    </button>
                </div>
            </div>,
            document.getElementById('snackbar')!
        );
    }

    componentDidMount() {
        // Add keyboard events.
        document.addEventListener('keydown', this.keyboardEvents);
    }

    componentDidUpdate() {
        // Make sure the context is not empty.
        if (this.context.length) {
            // Loop through the available messages.
            for (const message of this.context) {
                // Make sure there is a message to display.
                if (message.length) {
                    // Show the snackbar with the given message.
                    this.showSnackbar(message);
                }
            }
        }
    }

    componentWillUnmount() {
        // Remove keyboard events.
        document.removeEventListener('keydown', this.keyboardEvents);
    }
}
