export default function useProfile() {
    const defaultProfile = {
        "extendedSettings": {
            "enable": process.env.REACT_APP_ENABLE_EXTENDED_SETTINGS === "true",
        }
    }
    
    const getProfileOption = (key) => {
        return key.split(".").reduce((o, i) => o[i], defaultProfile);
    }

    return [getProfileOption];
}

