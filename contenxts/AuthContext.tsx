"use client"
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {jwtDecode} from "jwt-decode";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

type User = {
    userCode: number;
    userName: string;
    role: string;
    iat: number;
    exp: number;
}
type AuthContextType = {
    user: User | null;
    isLoggedIn: boolean;
    login: (res:AxiosResponse) => void;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User|null>(null);
    const history = useRouter();
    useEffect(()=>{
        const token = localStorage.getItem('capstoneToken');
        if(token){
            const user: User = jwtDecode(token);
            setUser(user);
        }
    },[])
    const logout = () => {
        localStorage.removeItem('capstoneToken');
        setUser(null);
        history.push("/");
    }
    const login = (res:AxiosResponse) => {
        localStorage.setItem("capstoneToken", res.data);
        setUser(jwtDecode<User>(res.data));
        history.push("/");
    }
    const value: AuthContextType = {
        user: user,
        isLoggedIn: user?true:false,
        logout: logout,
        login: login,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    
    if(!ctx){
        throw new Error("useAuth는 AuthProvider 안에서만 사용해야 합니다.");
    }
    return ctx;
}