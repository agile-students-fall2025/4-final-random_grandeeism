/**
 * Mock Users - Test data source
 * Aligned with User Mongoose schema
 * IDs use simple format: user-1, user-2, etc.
 * All users use password: "password123" for testing
 */

const mockUsers = [
  {
    "id": "user-1",
    "username": "testuser",
    "email": "test@example.com",
    "password": "$2b$10$jcEj6sjl66RE7jKt90IX.eVsUXkC27jcZJ3VHKrBC/9CbdPykQopW",
    "isActive": true,
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "avatar": "/images/default-avatar.png",
      "bio": "Test account",
      "preferences": {
        "theme": "light",
        "notifications": false,
        "autoArchive": false,
        "readingGoal": 5,
        "language": "en",
        "timezone": "UTC"
      }
    },
    "stats": {
      "totalArticles": 0,
      "totalReadingTime": 0,
      "favoriteCount": 0,
      "tagsUsed": 0,
      "joinedDate": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "streakDays": 0,
      "longestStreak": 0
    },
    "security": {
      "lastPasswordChange": "2024-01-01T00:00:00.000Z",
      "failedLoginAttempts": 0,
      "twoFactorEnabled": false
    },
    "subscription": {
      "plan": "free",
      "expiresAt": null,
      "features": []
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "user-2",
    "username": "demo",
    "email": "demo@test.com",
    "password": "$2b$10$jcEj6sjl66RE7jKt90IX.eVsUXkC27jcZJ3VHKrBC/9CbdPykQopW",
    "isActive": true,
    "profile": {
      "firstName": "Demo",
      "lastName": "User",
      "avatar": "/images/default-avatar.png",
      "bio": "Demo account",
      "preferences": {
        "theme": "dark",
        "notifications": true,
        "autoArchive": false,
        "readingGoal": 10,
        "language": "en",
        "timezone": "UTC"
      }
    },
    "stats": {
      "totalArticles": 2,
      "totalReadingTime": 10,
      "favoriteCount": 0,
      "tagsUsed": 0,
      "joinedDate": "2024-01-02T00:00:00.000Z",
      "lastLogin": "2024-01-05T00:00:00.000Z",
      "streakDays": 1,
      "longestStreak": 2
    },
    "security": {
      "lastPasswordChange": "2024-01-02T00:00:00.000Z",
      "failedLoginAttempts": 0,
      "twoFactorEnabled": false
    },
    "subscription": {
      "plan": "free",
      "expiresAt": null,
      "features": []
    },
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z"
  }
];

module.exports = { mockUsers };
