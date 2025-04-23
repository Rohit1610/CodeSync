'use client'
import { createContext , useContext , useState } from "react"

const GlobalContext = createContext()

export function GlobalProvider ({ children }) {

  const [notificationCount , setNotificationCount] = useState(0)

    return (
        <GlobalContext.Provider value={{
            notificationCount , setNotificationCount
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export function useGlobalContext () {
    return useContext(GlobalContext)
}