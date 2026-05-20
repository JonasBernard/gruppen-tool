export default function useProfile() {
    const defaultProfile = {
        "extendedSettings": {
            "enable": true,
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

