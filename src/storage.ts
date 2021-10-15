import { ChecklistData } from './types';

/**
 * Storage
 *
 * Basic wrapper for the localStorage API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 *
 * @export
 * @class Storage
 * @version 1.0.0
 */
export default class Storage {
    prefix: string;

    /**
     * Creates an instance of Storage.
     *
     * @param {string} [prefix] Supplied prefix is applied to all requests.
     * @memberof Storage
     * @since 1.0.0
     */
    constructor(prefix?: string) {
        if (prefix) {
            this.prefix = prefix;
        } else {
            this.prefix = '';
        }
    }

    /**
     * get
     *
     * Wrapper for `localStorage.getItem()`.
     * Converts returned data with `JSON.parse()`.
     *
     * @param {string} key Key to look for in localStorage
     * @return {*} {Promise<unknown>}
     * @example Storage.get('animals');
     * @memberof Storage
     * @since 1.0.0
     */
    async get(key: string): Promise<unknown> {
        await Promise.resolve();
        return JSON.parse(localStorage.getItem(this.prefixed(key)) as string);
    }

    /**
     * set
     *
     * Wrapper for `localStorage.setItem()`.
     * Converts supplied value with `JSON.stringify()`.
     *
     * @param {string} key Identifier in localStorage
     * @param {string | number | unknown[] | Record<string, unknown>| ChecklistData} value Data to save
     * @example Storage.set('animals', ['cats', 'dogs'])
     * @memberof Storage
     * @since 1.0.0
     */
    async set(
        key: string,
        value: string | number | unknown[] | Record<string, unknown> | ChecklistData
    ): Promise<void> {
        await Promise.resolve();
        localStorage.setItem(this.prefixed(key), JSON.stringify(value));
    }

    /**
     * delete
     *
     * Wrapper for `localStorage.removeItem()`.
     *
     * @param {string} key Identifier in localStorage
     * @example Storage.delete('animals');
     * @memberof Storage
     * @since 1.0.0
     */
    async delete(key: string): Promise<void> {
        await Promise.resolve();
        localStorage.removeItem(this.prefixed(key));
    }

    /**
     * keys
     *
     * Returns an Array holding all localStorage keys.
     *
     * @return {*} {string[]}
     * @memberof Storage
     * @since 1.0.0
     */
    async keys(): Promise<string[]> {
        await Promise.resolve();

        if (this.prefix.length) {
            return Object.keys(localStorage).filter((key) => key.includes(this.prefix));
        } else {
            return Object.keys(localStorage);
        }
    }

    /**
     * prefixed
     *
     * If a prefix is available, returns the key with applied prefix, otherwise just returns the key.
     *
     * @param {string} key Key to prefix
     * @return {*} {string}
     * @memberof Storage
     * @since 1.0.0
     */
    private prefixed(key: string): string {
        if (key.includes(this.prefix)) {
            return key;
        } else {
            return this.prefix.length ? `${this.prefix}-${key}` : key;
        }
    }
}
