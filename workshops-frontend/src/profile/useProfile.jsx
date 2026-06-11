export default function useProfile() {
    const defaultProfile = {
        "extendedSettings": {
            "enable": process.env.REACT_APP_ENABLE_EXTENDED_SETTINGS === "true" || process.env.NODE_ENV === "development",
        },
        "adminTab": {
            "enable": process.env.REACT_APP_ENABLE_ADMIN_PAGE === "true" || process.env.NODE_ENV === "development",
            "postHogPersonalApiKey": process.env.REACT_APP_POSTHOG_PERSONAL_API_KEY,
        }
    }
    
    const getProfileOption = (key) => {
        try {
            return key.split(".").reduce((o, i) => o[i], defaultProfile);
        } catch (error) {
            console.error(`Error getting profile option for key "${key}":`, error);
            return null;
        }
    }

    return [getProfileOption];
}

