# Overview

This repository implements a full-stack mood-based recipe recommendation application with the following features:

- **SCRUM-413: Mood Input Interface Implementation**
  - Frontend component for user mood selection.
  - Integration with backend API to submit mood data.

- **SCRUM-414: Recipe Recommendation Engine Development**
  - Backend engine matching moods to recipes stored in MongoDB.
  - API endpoint `GET /api/recipes?mood=<moodName>`.

- **SCRUM-415: User Authentication and Authorization**
  - JWT-based user signup and login.
  - Password hashing for secure storage.
  - APIs `POST /api/auth/signup` and `POST /api/auth/login`.

- **SCRUM-416: User Favorites Management**
  - Users can save and manage favorite recipes.
  - API `POST /api/users/:id/favorites` for favorites management.

- **SCRUM-417: Mood Tracking and Analytics Feature**
  - Stores user mood history.
  - Analytics endpoint `GET /api/users/:id/analytics` for mood trends.

- **SCRUM-418: Social Sharing Integration for Recipes**
  - Enables sharing recipes on social media.
  - API `POST /api/recipes/share` and UI components.

- **SCRUM-419: Dietary Preferences and Recipe Filtering**
  - Filter recipes by dietary preferences (vegetarian, gluten-free, etc.).
  - Updated data models and APIs supporting filtering.

- **SCRUM-420: AI-Based Mood Detection Integration**
  - Sentiment analysis microservice for mood detection from text.
  - API `POST /api/mood-detect`.

- **SCRUM-421: Grocery Delivery Service Integration**
  - Integration with third-party grocery delivery APIs.
  - API `POST /api/grocery/orders` for ordering ingredients.

This app provides an end-to-end user experience from mood input, personalized recipe recommendations, user account management, dietary filtering, mood analytics, social engagement, AI-based mood detection, and grocery delivery integration.