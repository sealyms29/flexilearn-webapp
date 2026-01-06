import newRequest from "./newRequest";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);

  try {
    const response = await newRequest.post("/upload/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Upload failed");
    }

    return response.data.secure_url;
  } catch (err) {
    console.error("Error uploading image:", err.message);
    throw err;
  }
};

export default upload;
