export const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/upload/')[1];
    const publicIdWithExtension = parts.split('.')[0];
    return publicIdWithExtension;
  } catch (err) {
    return null;
  }
};
