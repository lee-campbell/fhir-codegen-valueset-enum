/**
 * Removes illegal characters from strings in order to make them viable TypeScript variable names.
 * @param name The string to sanitise.
 * @returns The sanitised string.
 */
const sanitiseName = (name: string): string => {
  return name.replace(/[^\w$]/g, '_');
}

export {
  sanitiseName,
};
