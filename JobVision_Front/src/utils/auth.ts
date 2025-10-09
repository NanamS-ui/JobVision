// src/utils/auth.ts
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const TOKEN_KEY = 'jwt'

export async function storeJwtToken(token: string) {
    if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: TOKEN_KEY, value: token })
    } else {
        localStorage.setItem(TOKEN_KEY, token)
    }

    window.dispatchEvent(new Event('authChanged')) // pour forcer mise à jour
}

export async function removeJwtToken() {
    if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key: TOKEN_KEY })
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }

    window.dispatchEvent(new Event('authChanged'))
}

export async function getJwtToken(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
        const result = await Preferences.get({ key: TOKEN_KEY })
        return result.value
    } else {
        return localStorage.getItem(TOKEN_KEY)
    }
}
