import axios from "axios";

const API_KEY = process.env.HUGGINGFACE_API_KEY;
if (!API_KEY) {
  throw new Error("Missing Hugging Face API Key.");
}
const MODEL = "mistralai/Mistral-7B-Instruct";

export const getHuggingFaceResponse = async (message) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      { inputs: message },
      { headers: { Authorization: `Bearer ${API_KEY}`} }
    );
    return response.data[0]?.generated_text || "I'm not sure how to respond.";
  } catch (error) {
    console.error("Hugging Face API Error:", error);
    return "Sorry, I couldn't process that request.";
  }
};