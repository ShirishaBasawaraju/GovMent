<<<<<<< HEAD
# Bureaucracy.exe: Your Guide to Government Schemes

This project is a web application designed to help Indian citizens find and understand government schemes that are relevant to their needs. It uses a combination of a rule-based matching system and a conversational AI to provide a personalized and user-friendly experience.

## Key Features

*   **Scheme Matching**: Recommends relevant government schemes based on a user's profile, including age, occupation, income, and location.
*   **Conversational AI**: A friendly chatbot, **Babu Bot**, that can answer questions, provide explanations, and help users update their profiles.
*   **Detailed Explanations**: Offers clear and concise explanations of why a particular scheme is recommended, making it easy for users to understand their eligibility.
*   **Dark Mode**: Includes a theme toggle for a comfortable viewing experience in low-light environments.

## How It Works

The application's core functionality is divided into two main parts: the scheme-matching engine and the conversational AI.

### Scheme Matching

The matching process is handled by a sophisticated algorithm that evaluates a user's eligibility and calculates a "match score" for each scheme. This is done in three steps:

1.  **Eligibility Check**: The system first filters out schemes for which the user is not eligible based on criteria such as age, occupation, income, and location.
2.  **Scoring**: For the remaining schemes, a score is calculated based on a weighted average of three factors:
    *   **Jaccard Similarity (50%)**: Measures the similarity between the user's profile description and the scheme's description.
    *   **Keyword Hit (30%)**: Checks for the presence of relevant keywords in the user's profile.
    *   **Priority (20%)**: A predefined value that reflects the importance of the scheme.
3.  **Final Matcher**: The schemes are then sorted by their match score, and the top recommendations are presented to the user.

### Conversational AI

The application features a chatbot, **Babu Bot**, powered by the Google Gemini API. The bot is designed to be a friendly and helpful assistant that can:

*   **Answer Questions**: Provide information about government schemes and the application itself.
*   **Explain Recommendations**: Offer detailed explanations of why a particular scheme was recommended.
*   **Update Profiles**: Help users update their profiles with new information.

The bot is designed to speak in Hinglish (a mix of Hindi and English) to make it more accessible to a wider audience.

## Project Structure

The project is organized into the following main directories:

*   `src/ai`: Contains the logic for the conversational AI, including the `useGemini` hook for interacting with the Gemini API and the `reasoner.js` file for generating explanations.
*   `src/components`: Includes all the React components used in the application, such as the `BabuBot` chatbot, the `ProfilePanel` for managing user information, and the `ResultsPanel` for displaying scheme recommendations.
*   `src/data`: Stores the application's data, including the `schemes.json` file, which contains a list of all the government schemes.
*   `src/lib`: Contains the core logic of the application, including the `matcher.js` file, which handles the scheme-matching process.
*   `src/services`: Includes the `gemini.js` file, which is responsible for making calls to the Google Gemini API.
=======
# GovMent
Personalized Government Scheme Assistant 
>>>>>>> 1c0773e36340c4aa714369e79446f3e485f21cb1
