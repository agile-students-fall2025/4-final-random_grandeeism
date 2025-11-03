/**
 * @file /src/data/mockUserProfile.js
 * @description Mock user profile data for development and testing
 * TODO: Replace with backend API call when available
 */

export const mockUserProfile = {
  email: "johndoe@gmail.com",
  name: "John Doe",
  username: "john_doe",
  avatar: "https://picsum.photos/200/200?random=1"
};

// Helper function to get user profile (placeholder for future API integration)
export const getUserProfile = () => {
  // TODO: Replace with API call: GET /api/user/profile
  return mockUserProfile;
};

