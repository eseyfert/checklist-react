import React from 'react';
import Dialog from '../Dialog/Dialog';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';
import TabsPanel from '../Tabs/TabsPanel';
import Storage from '../../storage';
import { ChecklistData } from '../../types';
import dayjs from 'dayjs';

import './Landing.scoped.scss';
import Icons from '../../assets/images/icons.svg';

interface LandingProps {
    data: ChecklistData[];
    onRefresh: () => void;
    onSlideChange: (name: string, data: ChecklistData | null) => void;
    onMessage: (message: string) => void;
}

interface LandingState {
    activeTab: number;
    dialogActive: boolean;
    dialogId: number;
    dialogUseKeyboard: boolean;
}

/**
 * Landing
 *
 * First slide visible when opening the app.
 * Shows either a welcome message or the currently available checklists.
 *
 * @export
 * @class Landing
 * @extends {React.Component<LandingProps, LandingState>}
 * @version 1.0.0
 */
export default class Landing extends React.Component<LandingProps, LandingState> {
    storage = new Storage('checklist'); // localStorage wrapper to get all available data.

    state = { activeTab: 0, dialogActive: false, dialogId: 0, dialogUseKeyboard: false };

    /**
     * openPreferences
     *
     * Request the Preferences slide.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    openPreferences = () => {
        this.props.onSlideChange('preferences', null);
    };

    /**
     * openAdd
     *
     * Request the Add slide.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    openAdd = () => {
        this.props.onSlideChange('add', null);
    };

    /**
     * openEdit
     *
     * Request the Edit slide with the given data.
     *
     * @param {ChecklistData} data The checklist data provided to the slide
     * @memberof Landing
     * @since 1.0.0
     */
    openEdit = (data: ChecklistData) => {
        this.props.onSlideChange('edit', data);
    };

    /**
     * openView
     *
     * Request the View slide with the given data.
     *
     * @param {ChecklistData} data The checklist data provided to the slide
     * @memberof Landing
     * @since 1.0.0
     */
    openView = (data: ChecklistData) => {
        this.props.onSlideChange('view', data);
    };

    /**
     * date
     *
     * Convert timestamp to date string showing month, day and year.
     *
     * @param {number} time The timestamp to convert
     * @memberof Landing
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
     * @memberof Landing
     * @since 1.0.0
     */
    time = (time: number): string => {
        return dayjs(time).format('H:mm A');
    };

    /**
     * setActiveTab
     *
     * Set the active tab with the given index.
     * `0` targets the first tab, `1` the second.
     *
     * @param {number} index The tab index
     * @memberof Landing
     * @since 1.0.0
     */
    setActiveTab = (index: number) => {
        this.setState({
            activeTab: index,
        });
    };

    /**
     * switchActiveTab
     *
     * Allows the left and right arrow keys on the keyboard to switch the active tab.
     *
     * @param {React.KeyboardEvent<HTMLButtonElement>} $event
     * @memberof Landing
     * @since 1.0.0
     */
    switchActiveTab = ($event: React.KeyboardEvent<HTMLButtonElement>) => {
        // Get the currently active tab.
        let targetIndex = this.state.activeTab;

        if ($event.key === 'ArrowLeft') {
            $event.preventDefault();

            // If the left arrow key has been used, we either move one tab backwards or jump to the end of the tab order.
            if (targetIndex > 0) {
                targetIndex = 0;
            } else {
                targetIndex = 1;
            }
        } else if ($event.key === 'ArrowRight') {
            $event.preventDefault();

            // If the right arrow key has been used, we either move one tab forwards or jump to the start of the tab order.
            if (targetIndex < 1) {
                targetIndex = 1;
            } else {
                targetIndex = 0;
            }
        }

        // Set the active tab using the calculated index.
        this.setActiveTab(targetIndex);
    };

    /**
     * openDialog
     *
     * Open the `Remove checklist` dialog window.
     *
     * @param {number} id The id of the checklist to remove
     * @memberof Landing
     * @since 1.0.0
     */
    openDialog = (id: number) => {
        this.setState({
            dialogActive: true,
            dialogId: id,
            dialogUseKeyboard: false,
        });
    };

    /**
     * openKbDialog
     *
     * Open the `Remove checklist` dialog window with keyboard controls.
     *
     * @param {React.KeyboardEvent<HTMLButtonElement>} $event
     * @param {number} id The id of the checklist to remove
     * @memberof Landing
     * @since 1.0.0
     */
    openKbDialog = ($event: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
        if ($event.key === 'Enter' || $event.key === ' ') {
            $event.preventDefault();

            this.setState({
                dialogActive: true,
                dialogId: id,
                dialogUseKeyboard: true,
            });
        }
    };

    /**
     * cancelDialog
     *
     * Close the dialog window.
     *
     * @memberof Landing
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
     * Delete the requested checklist from storage and refresh the Landing data.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    deleteChecklist = () => {
        // Delete the checklist from storage.
        this.storage.delete(this.state.dialogId.toString()).then(() => {
            // Hide the dialog.
            this.cancelDialog();

            // Refresh the Landing data.
            this.props.onRefresh();

            // Display a message to the user.
            this.props.onMessage('Checklist successfully removed');
        });
    };

    /**
     * unfinishedChecklists
     *
     * Render the HTML for the unfinished checklists.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    unfinishedChecklists = () => {
        // Create list of all unfinished checklists.
        const incompleteLists = this.props.data.filter((data) => data.complete === false);

        // Create array of unfinished checklist elements.
        const items = incompleteLists.map((data) => (
            <li className="mdf-checklist-list__item" key={data.id}>
                <button
                    className="mdf-button mdf-button--icon"
                    aria-label="View checklist"
                    onClick={() => this.openView(data)}
                >
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#checklist`}></use>
                    </svg>
                </button>

                <div
                    className="mdf-checklist-list__item-content"
                    aria-label="View checklist"
                    onClick={() => this.openView(data)}
                >
                    <h6 className="mdf-checklist-list__item-title">{data.title}</h6>

                    <span className="mdf-checklist-list__item-meta">
                        Created {this.date(data.time)} at {this.time(data.time)} &mdash; Tasks left:{' '}
                        {data.tasks.length - data.done.length}
                    </span>
                </div>

                <button
                    className="mdf-button mdf-button--icon"
                    aria-label="Edit checklist"
                    onClick={() => this.openEdit(data)}
                >
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#edit`}></use>
                    </svg>
                </button>
            </li>
        ));

        // Return the elements for rendering.
        return items;
    };

    /**
     * completedChecklists
     *
     * Render the HTML for the completed checklists.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    completedChecklists = () => {
        // Create list of all completed checklists.
        const completeLists = this.props.data.filter((data) => data.complete === true);

        // Create array of complete checklist elements.
        const items = completeLists.map((data) => (
            <li className="mdf-checklist-list__item mdf-checklist-list__item--complete" key={data.id}>
                <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${Icons}#checklist`}></use>
                </svg>

                <div className="mdf-checklist-list__item-content">
                    <h6 className="mdf-checklist-list__item-title">{data.title}</h6>

                    <span className="mdf-checklist-list__item-meta">
                        Created {this.date(data.time)} at {this.time(data.time)} &mdash; Tasks left:{' '}
                        {data.tasks.length - data.done.length}
                    </span>
                </div>

                <button
                    className="mdf-button mdf-button--icon"
                    aria-label="Delete task"
                    onClick={() => this.openDialog(data.id)}
                    onKeyDown={($event) => this.openKbDialog($event, data.id)}
                >
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#delete`}></use>
                    </svg>
                </button>
            </li>
        ));

        // Return the elements for rendering.
        return items;
    };

    /**
     * showTabs
     *
     * Renders the HTML for the open/complete tabs holding our checklists.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    showTabs = () => {
        return (
            <div className="mdf-group mdf-group--stacked">
                <Tabs activeTab={this.state.activeTab}>
                    <div
                        className="mdf-tabs__bar mdf-tabs__bar--left"
                        role="tablist"
                        aria-label="Display open or completed tasks"
                    >
                        <Tab
                            id={0}
                            selected={this.state.activeTab === 0 ? true : false}
                            onClick={() => this.setActiveTab(0)}
                            onKeyDown={($event) => this.switchActiveTab($event)}
                        >
                            Open ({this.props.data.filter((data) => !data.complete).length})
                        </Tab>

                        <Tab
                            id={1}
                            selected={this.state.activeTab === 1 ? true : false}
                            onClick={() => this.setActiveTab(1)}
                            onKeyDown={($event) => this.switchActiveTab($event)}
                        >
                            Complete ({this.props.data.filter((data) => data.complete).length})
                        </Tab>
                    </div>

                    <div className="mdf-tabs__panels">
                        <TabsPanel id={0} selected={this.state.activeTab === 0 ? true : false}>
                            {this.props.data.filter((data) => !data.complete).length === 0 && (
                                <h5 style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    Seems like you have no open checklists right now.
                                    <br />
                                    Why not add one?
                                </h5>
                            )}

                            <ul className="mdf-checklist-list">{this.unfinishedChecklists()}</ul>
                        </TabsPanel>

                        <TabsPanel id={1} selected={this.state.activeTab === 1 ? true : false}>
                            <ul className="mdf-checklist-list">{this.completedChecklists()}</ul>
                        </TabsPanel>
                    </div>
                </Tabs>

                <button
                    id="add-checklist"
                    className="mdf-button mdf-button--filled mdf-button--icon"
                    aria-label="Add another checklist"
                    onClick={this.openAdd}
                >
                    <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <use href={`${Icons}#add`}></use>
                    </svg>
                </button>

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
    };

    /**
     * welcomeMessage
     *
     * Initial welcome message when no checklists exist yet.
     *
     * @memberof Landing
     * @since 1.0.0
     */
    welcomeMessage = () => {
        return (
            <div id="landing">
                <p id="landing-heading">
                    Welcome to <strong>Thoughts.</strong>
                    <br />
                    <span>A simple and elegant checklist app that helps you stay organized.</span>
                </p>

                <button className="mdf-button mdf-button--filled mdf-button--large" onClick={this.openAdd}>
                    Get started now
                </button>
            </div>
        );
    };

    render() {
        return (
            <div className="mdf-slide">
                <header className="mdf-slide__header">
                    <h2 className="mdf-slide__title">Thoughts.</h2>

                    <div className="mdf-slide__controls">
                        <button
                            id="show-options"
                            className="mdf-button mdf-button--icon"
                            aria-label="Show app options"
                            onClick={this.openPreferences}
                        >
                            <svg className="mdf-icon" viewBox="0 0 24 24" aria-hidden="true">
                                <use href={`${Icons}#controls`} />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="mdf-slide__main">
                    <div className={`mdf-slide__content ${this.props.data.length ? 'mdf-slide__content--top' : ''}`}>
                        {this.props.data.length ? this.showTabs() : this.welcomeMessage()}
                    </div>
                </main>

                <footer className="mdf-slide__footer">
                    <span className="mdf-copyright">
                        App lovingly created by{' '}
                        <a href="https://miraidesigns.net/" target="_blank" rel="noreferrer">
                            Mirai Designs
                        </a>
                    </span>
                </footer>
            </div>
        );
    }
}
