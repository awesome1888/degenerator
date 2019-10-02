/**
 * https://github.com/sapegin/jest-cheat-sheet
 * https://testing-library.com/docs/react-testing-library/cheatsheet
 */

import React from 'react';
import { fireEvent, cleanup, render, prettyDOM, waitForElement } from '@testing-library/react';

import { <!- component_name -> } from '../<!- component_name ->';

describe('<<!- component_name -> />', () => {
    afterEach(async () => {
        cleanup();
    });

    it('should render itself without errors', async () => {
        const { container, getByTestId } = render(
            <<!- component_name -> />,
        );

        // // ///////////////////////
        // // a short cheat sheet
        //
        // // how to print out current DOM
        // console.log(prettyDOM(container));
        //
        // // how to search for elements
        // const button = container.querySelector(
        //     '[data-testid="search-submit"]'
        // ) as HTMLButtonElement;
        // const input = container.querySelector(
        //     '[data-testid="search-input"]'
        // ) as HTMLInputElement;
        //
        // // how to fire events
        // fireEvent.click(button);
        // fireEvent.change(input, { target: { value: 'some value' } });
        //
        // // how to wait for async events to change the DOM:
        // const element = await waitForElement(
        //     () => getByTestId(container, 'element'),
        //     { container, timeout: 1000 }
        // );
        //
        // expect(element).toBeInstanceOf(HTMLElement);
    });
});
