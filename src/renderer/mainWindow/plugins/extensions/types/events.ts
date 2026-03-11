import type {FC} from 'react';

/**
 * Events related to extension lifecycle and interactions within the renderer process.
 */
export type ExtensionEvents = {
  /**
   * Triggered before a card starts running.
   * @param id - The ID of the card.
   */
  before_card_start: {id: string};

  /**
   * Triggered before a card installation begins.
   * @param id - The ID of the card.
   */
  before_card_install: {id: string};

  /**
   * Allows adding a custom step to the card installation process.
   * @param id - The ID of the card.
   * @param addStep - Function to add a step.
   * @param addStep.atIndex - The index at which to insert the step.
   * @param addStep.title - The title of the step.
   * @param addStep.content - The React component to render for the step.
   */
  card_install_addStep: {
    id: string;
    addStep: (atIndex: number, title: string, content: FC) => void;
  };

  /**
   * Allows collecting user input for a card.
   * @param id - The ID of the card.
   * @param addElements - Function to add input elements.
   * @param addElements.elements - Array of React components to render as input fields.
   */
  card_collect_user_input: {
    id: string;
    addElements: (elements: FC[]) => void;
  };
};
