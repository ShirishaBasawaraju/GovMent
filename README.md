# GovMent: Personalized Government Scheme Assistant

## 1. Introduction

GovMent is a web-based application designed to help Indian citizens discover and understand government welfare schemes relevant to their personal circumstances. Information about government schemes can be spread across multiple websites and official resources, making it difficult for citizens to identify suitable schemes, understand eligibility requirements, and determine which documents are required.

GovMent addresses this problem through personalized scheme recommendations, rule-based eligibility assessment, and an AI-powered conversational assistant named **Babu Bot**. The application evaluates user profile information and compares it with scheme eligibility criteria to present relevant recommendations. It also provides guidance on government documents and post office savings schemes through a user-friendly interface.

## 2. Objectives

The primary objective of GovMent is to simplify access to government scheme information.

The project aims to:
- Recommend government schemes based on personal details such as age, occupation, income, and location.
- Assess eligibility using predefined scheme criteria.
- Explain why a scheme matches a user's profile.
- Identify additional information that may be required to assess eligibility.
- Provide conversational assistance through the Google Gemini API.
- Present information about government documents and post office savings schemes.
- Improve the accessibility of scheme information through a responsive web interface.

## 3. Key Features

### 3.1 Personalized Scheme Recommendations
The application compares user profile information with government scheme data and identifies potentially relevant schemes.

### 3.2 Eligibility Assessment
The system evaluates available profile details against predefined eligibility criteria, helping users understand whether they appear eligible, may need to provide additional information, or do not meet the specified requirements.

### 3.3 Scheme Matching and Explanations
A matching algorithm evaluates relevant information, calculates match scores, and ranks recommendations. The application provides explanations to help users understand why schemes are recommended.

### 3.4 Babu Bot — AI-Powered Assistant
Babu Bot integrates the Google Gemini API to provide conversational assistance. Users can ask questions about government schemes and request explanations or guidance. The assistant is designed to communicate in accessible language, including Hinglish where appropriate.

### 3.5 Government Documents Centre
This module provides guidance about government documents, their purposes, and commonly required documents or information for applications.

### 3.6 Post Office Savings Schemes
The application presents information about post office savings options to help users explore available savings products and understand their general features.

### 3.7 User Interface and Theme Support
The application provides an interactive interface with responsive layouts and dark mode support for a more comfortable user experience.

## 4. System Architecture

GovMent consists of the following major components:

- **Frontend:** React.js provides the user interface and interactive application components.
- **Scheme Data Source:** JSON files store structured scheme information and eligibility criteria.
- **Matching Engine:** JavaScript logic evaluates user profiles against scheme data and generates recommendations.
- **AI Integration:** The Google Gemini API powers conversational assistance through Babu Bot.
- **Information Modules:** Dedicated sections present government document guidance and post office savings information.

The frontend brings these components together to provide users with a single interface for exploring schemes and related information.

## 5. Scheme-Matching Methodology

The scheme-matching process uses structured scheme information and user profile details.

### Step 1: Profile Collection
The application collects relevant information, such as age, occupation, income, state, location type, and other available profile details.

### Step 2: Eligibility Evaluation
The matching logic compares the user's details with each scheme's predefined eligibility conditions. Depending on the information available, a scheme may be identified as eligible, potentially eligible pending additional information, or not eligible.

### Step 3: Match Scoring
Relevant schemes can be ranked using factors such as profile-description similarity, keyword matches, and scheme priority.

In the original matching approach, these factors are weighted as follows:

- **Jaccard Similarity — 50%:** Measures the overlap between relevant words in the user description and scheme information.
- **Keyword Matching — 30%:** Evaluates the presence of relevant keywords.
- **Scheme Priority — 20%:** Incorporates the predefined priority assigned to a scheme.

These weights describe the matching approach and should be kept consistent with the implementation in the source code.

### Step 4: Recommendation Presentation
The application displays matching schemes with relevant explanations, helping users understand their possible eligibility and next steps.

**Note:** Recommendations are informational and do not constitute official confirmation of eligibility. Users should verify current requirements through the relevant government department or official scheme website.

## 6. AI Integration: Google Gemini API

GovMent integrates the Google Gemini API to provide AI-powered conversational assistance through Babu Bot.

The assistant is intended to:
- Answer questions about government schemes.
- Explain scheme information in accessible language.
- Help users understand recommendation results.
- Provide guidance based on the information available to the application.
- Support a conversational user experience.

The scheme-matching engine and the AI assistant serve different purposes. The matching engine evaluates structured eligibility information, while the Gemini API generates conversational responses. AI-generated answers should be verified against official sources, particularly when eligibility conditions, benefits, or application deadlines may change.

## 7. Data Source and Management

GovMent uses **JSON files as its scheme data source rather than a database**.

JSON stores structured information such as scheme names, descriptions, benefits, eligibility criteria, locations, keywords, and priority values. The application reads this information to evaluate eligibility and generate recommendations.

This approach is suitable for a student project because it provides a straightforward way to maintain structured data and demonstrate the recommendation process without requiring a database server.

Scheme information should be reviewed periodically against official government sources to maintain accuracy.

## 8. Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| Vite | Development server and production build |
| JavaScript | Application logic and scheme matching |
| Tailwind CSS | Interface styling |
| JSON | Storing structured scheme information |
| Google Gemini API | AI-powered conversational assistance |
| Framer Motion | Interface animations |
| React Router | Client-side navigation, where configured |

## 9. Project Structure

The application contains several directories responsible for different aspects of the system.

- **`src/ai`** — AI-related functionality, including conversational integration and explanation logic.
- **`src/components`** — Reusable interface components, including profile management, scheme results, and Babu Bot.
- **`src/data`** — JSON data files containing government scheme information.
- **`src/lib`** — Core application logic, including scheme eligibility and matching functions.
- **`src/services`** — Service functions used for integrations such as the Google Gemini API.
- **`public`** — Static assets served by the frontend, where applicable.

The exact files may vary as the project develops.

## 10. Installation and Execution

### Prerequisites
- Node.js and npm installed on your system.
- A code editor such as Visual Studio Code.
- A Google Gemini API key if AI-powered features require it.

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/ShirishaBasawaraju/GovMent.git
```

**2. Navigate to the project directory**

```bash
cd GovMent
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in the terminal to access the application.

**Important:** Configure the Gemini API key using the environment-variable method supported by the project. Do not commit API keys or other secrets to GitHub.

## 11. Live Demo

Access the deployed application:

**[GovMent — Personalized Government Scheme Assistant](https://shirishabasawaraju.github.io/GovMent/)**

## 12. Limitations and Future Enhancements

The accuracy of recommendations depends on the completeness and currency of the JSON scheme data. Changes to government rules may require updates to the stored eligibility criteria. AI-generated responses may also require verification against official sources.

Future enhancements could include:
- Expanding the collection of verified government schemes.
- Adding official application links and source references for individual schemes.
- Providing multilingual support.
- Improving accessibility for users with disabilities.
- Adding automated checks for outdated scheme information.
- Improving eligibility explanations and document checklists.

## 13. Conclusion

GovMent demonstrates how structured JSON data, rule-based eligibility assessment, scheme matching, and AI-powered conversational assistance can be combined to make government scheme information easier to explore. By providing personalized recommendations, explanations, and supporting information, the project aims to improve users' ability to identify schemes that may be relevant to their needs.

