/**
 * Utility functions for dashboard features
 */

/**
 * Generate user initials from full name
 * @param fullName - The user's full name
 * @returns String containing user initials (e.g., "John Doe" -> "JD")
 */
export function generateUserInitials(fullName: string): string {
  if (!fullName || fullName.trim() === '') {
    return 'U'; // Default to 'U' for User
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) {
    return 'U';
  }
  
  if (nameParts.length === 1) {
    // If only one name part, take first two characters
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  // Take first letter of first name and first letter of last name
  const firstInitial = nameParts[0].charAt(0);
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Generate initials from email if full name is not available
 * @param email - User's email address
 * @returns String containing initials from email
 */
export function generateInitialsFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'U';
  }
  
  const username = email.split('@')[0];
  return username.substring(0, 2).toUpperCase();
}