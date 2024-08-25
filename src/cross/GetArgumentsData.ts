import {ArgumentItem, ArgumentsData} from '../renderer/src/App/Modules/types';

/**
 * Checks if an argument with the given name exists in the Arguments data structure.
 * @param args - The Arguments data structure to search in.
 * @param name - The name of the argument to search for.
 * @returns True if the argument exists, false otherwise.
 */
export function isValidArg(args: ArgumentsData, name: string): boolean {
  if (!name) return false;

  return args.some(arg => {
    if ('sections' in arg) {
      return arg.sections.some(section => section.items.some(item => item.name === name));
    }
    return arg.items.some(item => item.name === name);
  });
}

/**
 * Filters the Arguments data structure based on the provided filter keys.
 * @param args - The Arguments data structure to filter.
 * @param filterKeys - An array of keys to filter out from the Arguments.
 * @returns A new filtered Arguments data structure, or undefined if the input is undefined.
 */
export function getFilteredArguments(args?: ArgumentsData, filterKeys: string[] = []): ArgumentsData | undefined {
  if (!args) return undefined;
  if (filterKeys.length === 0) return args;

  const filterSet = new Set(filterKeys);

  return args.map(arg => {
    if ('sections' in arg) {
      return {
        ...arg,
        sections: arg.sections.map(section => ({
          ...section,
          items: section.items.filter(item => !filterSet.has(item.name)),
        })),
      };
    }
    return {...arg, items: arg.items.filter(item => !filterSet.has(item.name))};
  });
}

/**
 * Finds an argument item by its name in the Arguments data structure.
 * @param args - The Arguments data structure to search in.
 * @param name - The name of the argument to search for.
 * @returns The found Item object, or undefined if not found.
 */
export function getArgumentByName(args: ArgumentsData, name: string): ArgumentItem | undefined {
  if (!name) return undefined;

  for (const arg of args) {
    if ('sections' in arg) {
      for (const section of arg.sections) {
        const found = section.items.find(item => item.name === name);
        if (found) return found;
      }
    } else {
      const found = arg.items.find(item => item.name === name);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Gets a specific property of an argument by its name.
 * @param name - The name of the argument.
 * @param args - The Arguments data structure to search in.
 * @param property - The property to retrieve from the argument.
 * @returns The value of the specified property, or undefined if not found.
 */
function getArgumentProperty<K extends keyof ArgumentItem>(
  name: string,
  args: ArgumentsData | undefined,
  property: K,
): ArgumentItem[K] | undefined {
  if (!args) return undefined;
  const arg = getArgumentByName(args, name);
  return arg ? arg[property] : undefined;
}

export const getArgumentType = (name: string, args?: ArgumentsData) => getArgumentProperty(name, args, 'type');

export const getArgumentDefaultValue = (name: string, args?: ArgumentsData) =>
  getArgumentProperty(name, args, 'defaultValue');

export const getArgumentValues = (name: string, args?: ArgumentsData) => getArgumentProperty(name, args, 'values');

export const getArgumentDescription = (name: string, args?: ArgumentsData) =>
  getArgumentProperty(name, args, 'description');
