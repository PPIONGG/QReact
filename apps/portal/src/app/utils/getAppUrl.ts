export const getAppUrl = (appName: string, subApp?: string): string => {
  try {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;

    // Dev mode
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      const ports: Record<string, string> = {
        sales: '4201',
      };
      const baseUrl = `http://localhost:${ports[appName] || '4200'}`;

      if (appName === 'sales' && subApp === 'visitor') {
        return `${baseUrl}/#/`;
      }

      return subApp ? `${baseUrl}/${subApp}` : baseUrl;
    }

    // Specific host in prod
    if (currentHost === '192.168.0.131' && currentPort === '1005') {
      const baseUrl = 'http://192.168.0.131:1005';

      if (appName === 'sales' && subApp === 'visitor') {
        return `${baseUrl}/sales-visitor/`;
      }

      return subApp
        ? `${baseUrl}/${appName}-${subApp}/`
        : `${baseUrl}/${appName}/`;
    }

    // Generic production fallback
    const currentUrl = window.location.origin;

    if (appName === 'sales' && subApp === 'visitor') {
      return `${currentUrl}/sales-visitor/#/`;
    }

    return subApp
      ? `${currentUrl}/${appName}-${subApp}/`
      : `${currentUrl}/${appName}/`;
  } catch (error) {
    console.error('URL generation error:', error);
    return '/';
  }
};
