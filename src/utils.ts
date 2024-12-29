/**
 * Removes illegal characters from strings in order to make them viable TypeScript variable names.
 * @param name The string to sanitise.
 * @returns The sanitised string.
 */
const sanitiseName = (name?: string): string => {
  let sanitised = '';
  if (name) {
    sanitised = name.replace(/[^\w$]/g, '_');
    if (/^[0-9]/.test(sanitised)) {
      sanitised = `_${sanitised}`;
    }
  }
  return sanitised
}

export {
  sanitiseName,
};
