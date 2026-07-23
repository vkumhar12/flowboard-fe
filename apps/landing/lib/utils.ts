type ClassValue = string | false | null | undefined | ClassValue[];

export const cn = (...args: ClassValue[]): string => args.flat().filter(Boolean).join(" ");
