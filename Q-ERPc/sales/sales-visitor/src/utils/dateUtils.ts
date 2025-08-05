//  Format date to DD/MM/YYYY HH:MM:SS
export const formatDateTime = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    // Format date as DD/MM/YYYY
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    // Format time as HH:MM:SS
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return fallback;
  }
};

// Format date to DD/MM/YYYY only
export const formatDate = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return fallback;
  }
};

// Format time to HH:MM:SS only
export const formatTime = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Time";
    }

    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return fallback;
  }
};

// Format date to DD/MM/YYYY HH:MM (without seconds)
export const formatDateTimeShort = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return fallback;
  }
};

// Format date to Buddhist Era (พ.ศ.)
export const formatDateThai = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear() + 543; // Convert to Buddhist Era

    return `${day}/${month}/${year}`;
  } catch (error) {
    return fallback;
  }
};

// Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (
  date: string | Date | null,
  fallback: string = "-"
): string => {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return count === 1
          ? `1 ${interval.label} ago`
          : `${count} ${interval.label}s ago`;
      }
    }

    return "Just now";
  } catch (error) {
    return fallback;
  }
};

// Safe date comparison for sorting
export const compareDates = (
  a: string | Date | null,
  b: string | Date | null
): number => {
  // Handle null values - put null values at the end
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  try {
    const dateA = new Date(a);
    const dateB = new Date(b);

    // Handle invalid dates
    const timeA = dateA.getTime();
    const timeB = dateB.getTime();

    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;

    return timeA - timeB;
  } catch (error) {
    return 0;
  }
};
