// Simple upload utility - images are optional
// If upload fails, gig can still be created without images

const upload = async (file) => {
  // If no file provided, return empty string (optional image)
  if (!file) {
    return "";
  }

  // For now, just return empty - images are optional
  // You can replace this with actual upload service later
  console.warn("Image upload not configured - proceeding without image");
  return "";
};

export default upload;
