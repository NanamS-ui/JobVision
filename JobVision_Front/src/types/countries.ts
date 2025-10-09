export interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

export const COUNTRIES: Country[] = [
    { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪' },
    { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸' },
    { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
    { code: 'NL', name: 'Pays-Bas', dialCode: '+31', flag: '🇳🇱' },
    { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
    { code: 'SE', name: 'Suède', dialCode: '+46', flag: '🇸🇪' },
    { code: 'NO', name: 'Norvège', dialCode: '+47', flag: '🇳🇴' },
    { code: 'DK', name: 'Danemark', dialCode: '+45', flag: '🇩🇰' },
    { code: 'FI', name: 'Finlande', dialCode: '+358', flag: '🇫🇮' },
    { code: 'PL', name: 'Pologne', dialCode: '+48', flag: '🇵🇱' },
    { code: 'CZ', name: 'République tchèque', dialCode: '+420', flag: '🇨🇿' },
    { code: 'AT', name: 'Autriche', dialCode: '+43', flag: '🇦🇹' },
    { code: 'HU', name: 'Hongrie', dialCode: '+36', flag: '🇭🇺' },
    { code: 'RO', name: 'Roumanie', dialCode: '+40', flag: '🇷🇴' },
    { code: 'BG', name: 'Bulgarie', dialCode: '+359', flag: '🇧🇬' },
    { code: 'HR', name: 'Croatie', dialCode: '+385', flag: '🇭🇷' },
    { code: 'SI', name: 'Slovénie', dialCode: '+386', flag: '🇸🇮' },
    { code: 'SK', name: 'Slovaquie', dialCode: '+421', flag: '🇸🇰' },
    { code: 'LT', name: 'Lituanie', dialCode: '+370', flag: '🇱🇹' },
    { code: 'LV', name: 'Lettonie', dialCode: '+371', flag: '🇱🇻' },
    { code: 'EE', name: 'Estonie', dialCode: '+372', flag: '🇪🇪' },
    { code: 'IE', name: 'Irlande', dialCode: '+353', flag: '🇮🇪' },
    { code: 'GR', name: 'Grèce', dialCode: '+30', flag: '🇬🇷' },
    { code: 'CY', name: 'Chypre', dialCode: '+357', flag: '🇨🇾' },
    { code: 'MT', name: 'Malte', dialCode: '+356', flag: '🇲🇹' },
    { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺' },
];

// Fonction utilitaire pour obtenir un pays par son code
export const getCountryByCode = (code: string): Country | undefined => {
    return COUNTRIES.find(country => country.code === code);
};

// Fonction utilitaire pour obtenir un pays par son indicatif
export const getCountryByDialCode = (dialCode: string): Country | undefined => {
    return COUNTRIES.find(country => country.dialCode === dialCode);
};