export function mapSourceTypeToCollection(sourceType: string): string {
  if (sourceType === "post") {
    return "posts";
  }

  if (sourceType === "page") {
    return "pages";
  }

  if (sourceType.endsWith("s")) {
    return sourceType;
  }

  return `${sourceType}s`;
}
