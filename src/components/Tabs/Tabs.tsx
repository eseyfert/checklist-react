import React from 'react';

import './Tabs.scoped.scss';

interface TabsProps {
    activeTab: number;
    children: React.ReactChild[];
}

const CLASS = {
    stopTransitions: 'mdf-disable-transitions',
};

const SELECTOR = {
    panel: '.mdf-tabs__panel',
    selection: '.mdf-tabs__selection',
    tab: '.mdf-tabs__tab',
};

/**
 * Tabs
 *
 * Separate content into pairs of tabs and panels.
 * Each tab has a corresponding panel.
 *
 * @export
 * @class Tabs
 * @extends {React.Component<TabsProps>}
 * @version 1.0.0
 */
export default class Tabs extends React.Component<TabsProps> {
    containerRef: React.RefObject<HTMLDivElement> = React.createRef(); // Ref to the tabs container element.

    panels!: HTMLDivElement[]; // Holds all panel elements.
    prevTab!: number; // Store the previous tab.
    tabs!: HTMLButtonElement[]; // Holds all tab elements.

    /**
     * switchToTab
     *
     * Switch from one tab to another.
     *
     * @param {number} fromIndex Tab index to switch from
     * @param {number} toIndex Tab index to switch to
     * @memberof Tabs
     * @since 1.0.0
     */
    switchToTab = (fromIndex: number, toIndex: number) => {
        // Get the dimensions for the previous tab.
        const prevRect = this.tabs[fromIndex].getBoundingClientRect();

        // Get the dimensions for the new tab.
        const newRect = this.tabs[toIndex].getBoundingClientRect();

        // Get the selection bar for the new tab.
        const newSelection: HTMLElement = this.tabs[toIndex].querySelector(SELECTOR.selection)!;

        // Calculate the difference in width and positioning between the old and new tab.
        const widthDelta = prevRect.width / newRect.width;
        const leftDelta = prevRect.left - newRect.left;

        // Disable all transitions while we adjust the selection's model.
        newSelection.classList.add(CLASS.stopTransitions);

        // Setup the position the selection is moving from.
        newSelection.style.transform = `translateX(${leftDelta}px) scaleX(${widthDelta})`;

        // Force repaint, otherwise the transform will not work properly.
        newSelection.getBoundingClientRect();

        // Enable transitions again.
        newSelection.classList.remove(CLASS.stopTransitions);

        // Move the selection into place.
        newSelection.style.transform = '';
    };

    render() {
        return (
            <div ref={this.containerRef} className="mdf-tabs">
                {this.props.children}
            </div>
        );
    }

    componentDidMount() {
        // Get a list of all tab elements.
        this.tabs = Array.from(this.containerRef.current!.querySelectorAll(SELECTOR.tab));

        // Get a list of all panel elements.
        this.panels = Array.from(this.containerRef.current!.querySelectorAll(SELECTOR.panel));
    }

    componentDidUpdate(prevProps: TabsProps) {
        if (prevProps.activeTab !== this.props.activeTab) {
            // Store reference to the previous tab.
            this.prevTab = prevProps.activeTab;

            // Initiate switch to the new tab.
            this.switchToTab(this.prevTab, this.props.activeTab);
        }
    }
}
