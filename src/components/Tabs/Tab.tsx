import React from 'react';

interface TabProps {
    id: number;
    selected?: Boolean;
    onClick: () => void;
    onKeyDown: ($event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * Tab
 *
 * Tab button element to be used inside the Tabs component.
 *
 * @export
 * @class Tab
 * @extends {React.Component<TabProps>}
 * @version 1.0.0
 */
export default class Tab extends React.Component<TabProps> {
    tabRef: React.RefObject<HTMLButtonElement> = React.createRef(); // Ref to the button element.

    /**
     * checkFocus
     *
     * Check whether or not the tab needs to be focused.
     *
     * @memberof Tab
     * @since 1.0.0
     */
    checkFocus = () => {
        if (this.props.selected) {
            this.tabRef.current?.focus();
        }
    };

    /**
     * handleClick
     *
     * Handle click events on the tab.
     *
     * @memberof Tab
     * @since 1.0.0
     */
    handleClick = () => {
        // Forward the click event to the Tabs parent.
        this.props.onClick();

        // Set focus to the tab.
        this.tabRef.current?.focus();
    };

    /**
     * handleKeyDown
     *
     * Send keydown event to the Tabs parent.
     *
     * @param {React.KeyboardEvent<HTMLButtonElement>} $event
     * @memberof Tab
     * @since 1.0.0
     */
    handleKeyDown = ($event: React.KeyboardEvent<HTMLButtonElement>) => {
        this.props.onKeyDown($event);
    };

    render() {
        const { id, selected } = this.props;

        return (
            <button
                ref={this.tabRef}
                id={`tab-${id}`}
                className={`mdf-tabs__tab ${selected ? 'mdf-tabs__tab--selected' : ''}`}
                role="tab"
                aria-controls={`panel-${id}`}
                aria-selected={selected ? true : false}
                tabIndex={!selected ? -1 : undefined}
                onClick={this.handleClick}
                onKeyDown={($event) => this.handleKeyDown($event)}
            >
                <span className="mdf-tabs__content">
                    <span className="mdf-tabs__text">{this.props.children}</span>
                </span>

                <span className="mdf-tabs__selection"></span>
            </button>
        );
    }

    componentDidMount() {
        this.checkFocus();
    }

    componentDidUpdate() {
        this.checkFocus();
    }
}
