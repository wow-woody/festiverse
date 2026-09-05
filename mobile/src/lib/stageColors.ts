const STAGE_PALETTE = ['#ff5c72', '#ffb648', '#4dd8b0', '#9b7ede', '#5ac8fa', '#ff8fab'];

export function getStageColor(stageName: string | null, orderedStageNames: string[]) {
  if (!stageName) return STAGE_PALETTE[STAGE_PALETTE.length - 1];
  const index = orderedStageNames.indexOf(stageName);
  return STAGE_PALETTE[index % STAGE_PALETTE.length];
}
