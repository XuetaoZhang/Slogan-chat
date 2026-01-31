const gradients = [
  "bg-gradient-to-b from-blue-400 to-blue-500",
  "bg-gradient-to-b from-pink-400 to-pink-500",
  "bg-gradient-to-b from-green-500 to-green-600",
  "bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600",
  "bg-gradient-to-b from-yellow-300 to-yellow-400",
  "bg-gradient-to-b from-orange-300 to-orange-400",
  "bg-gradient-to-b from-teal-400 to-teal-500",
];

const colorAssignmentMap = new Map<string, string>();
let nextColorIndex = 0;

export const getGradientClass = (identifier: string): string => {
  if (!identifier) return gradients[0];
  if (colorAssignmentMap.has(identifier)) {
    return colorAssignmentMap.get(identifier)!;
  }
  const assignedColor = gradients[nextColorIndex];
  colorAssignmentMap.set(identifier, assignedColor);
  nextColorIndex = (nextColorIndex + 1) % gradients.length;
  return assignedColor;
};
