

export interface SignUPFormData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface SignInFromData {
    email: string;
    password: string;
}

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role: number;
    validationCode?: string;
    verified: boolean;
    username?: string;
    created?: string;
    updated?: string;
}
