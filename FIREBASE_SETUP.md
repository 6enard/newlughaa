# Firebase Setup Guide

This application now uses Firebase Authentication and Firestore for data storage.

## 1. Firebase Console Configuration

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method

### Create Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **production mode** (we'll deploy custom rules)
4. Select your preferred region

### Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration values

## 2. Environment Variables

Create a `.env` file in your project root with these values:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Deploy Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab
3. Copy the contents of `firestore.rules` from your project
4. Paste into the Firebase Console rules editor
5. Click **Publish**

Alternatively, use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

## 4. Deploy Firestore Indexes

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Indexes** tab
3. You can either:
   - Create indexes manually as they're needed (Firebase will prompt you)
   - Use Firebase CLI to deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

The `firestore.indexes.json` file contains all required indexes.

## 5. Seed Initial Data

You'll need to add sample data to your Firestore database. Use the Firebase Console or create a script:

### Languages Collection
```javascript
// Collection: languages
// Document ID: kalenjin
{
  name: "Kalenjin",
  nativeSpelling: "Kalenjin",
  description: "Learn the language of the Kalenjin community"
}

// Document ID: kikuyu
{
  name: "Kikuyu",
  nativeSpelling: "Gĩkũyũ",
  description: "Discover the Kikuyu language and culture"
}

// Document ID: luo
{
  name: "Luo",
  nativeSpelling: "Dholuo",
  description: "Master the Luo language"
}
```

### Lessons Collection
```javascript
// Collection: lessons
// Document ID: auto-generated
{
  title: "Basic Greetings",
  description: "Learn common greetings in all three languages",
  orderIndex: 1
}

// Add more lessons as needed
```

### Lesson Content Collection
```javascript
// Collection: lessonContent
// Document ID: auto-generated
{
  lessonId: "your_lesson_id_here",
  kalenjin: "Chamge",
  kikuyu: "Wĩ mwega",
  luo: "Oyawore",
  english: "Good morning",
  orderIndex: 1
}

// Add more content items as needed
```

## Firestore Collections Structure

### languages
- **id**: Auto-generated or custom (e.g., "kalenjin", "kikuyu", "luo")
- **name**: String (display name)
- **nativeSpelling**: String (native script)
- **description**: String

### lessons
- **id**: Auto-generated
- **title**: String
- **description**: String
- **orderIndex**: Number (for sorting)

### lessonContent
- **id**: Auto-generated
- **lessonId**: String (reference to lesson)
- **kalenjin**: String
- **kikuyu**: String
- **luo**: String
- **english**: String
- **orderIndex**: Number (for sorting within lesson)

### userLanguages
- **id**: Composite `{userId}_{languageId}`
- **userId**: String (Firebase Auth UID)
- **languageId**: String
- **createdAt**: Timestamp

### userProgress
- **id**: Composite `{userId}_{lessonId}`
- **userId**: String (Firebase Auth UID)
- **lessonId**: String
- **completed**: Boolean
- **completedAt**: Timestamp (nullable)
- **updatedAt**: Timestamp

## Security Rules Explanation

The `firestore.rules` file implements the following security:

1. **Languages, Lessons, LessonContent**: Read-only for authenticated users. Only admins can write (via Admin SDK).

2. **UserLanguages**: Users can only read and write their own language selections.

3. **UserProgress**: Users can only read and write their own progress data.

All queries verify authentication and ownership before allowing access.

## Indexes Explanation

The `firestore.indexes.json` file defines composite indexes for:

1. **lessonContent**: Query by `lessonId` and sort by `orderIndex`
2. **userLanguages**: Query by `userId`
3. **userProgress**: Query by `userId`

These indexes enable efficient queries for:
- Fetching lesson content in order
- Retrieving user's selected languages
- Getting user's lesson progress

## Testing

After setup:
1. Start the development server: `npm run dev`
2. Create a test account via the signup page
3. Verify authentication works
4. Check that you can view languages and lessons
5. Confirm that user selections are saved

## Troubleshooting

- **Authentication errors**: Verify Email/Password is enabled in Firebase Console
- **Permission denied**: Check that security rules are deployed correctly
- **Missing data**: Ensure you've seeded the collections with sample data
- **Query errors**: Verify that required indexes are created
