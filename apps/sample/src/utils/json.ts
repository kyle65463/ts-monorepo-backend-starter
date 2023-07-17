/**
 * Reviver function for JSON.parse to convert string to Date
 */
export const jsonReviver = (key: string, value: unknown) => {
  if (typeof value === "string") {
    const dateRegex =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/;
    const match = dateRegex.exec(value);
    if (match) {
      return new Date(
        Date.UTC(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1,
          parseInt(match[3], 10),
          parseInt(match[4], 10),
          parseInt(match[5], 10),
          parseInt(match[6], 10),
          parseInt(match[7], 10),
        ),
      );
    }
  }
  return value;
};
