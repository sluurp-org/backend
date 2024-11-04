export const kst = (date?: Date) => {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const kstDate = date ? new Date(date) : new Date();

  return new Date(kstDate.getTime() + KST_OFFSET);
};
