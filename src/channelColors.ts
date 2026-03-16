// Deterministic color assignment per channel title
const PALETTE = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff7043', '#7e57c2', '#26a69a', '#ef5350', '#42a5f5',
  '#ab47bc', '#66bb6a', '#ffa726', '#5c6bc0', '#ec407a',
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getChannelColor(channelTitle: string): string {
  return PALETTE[hash(channelTitle) % PALETTE.length];
}
