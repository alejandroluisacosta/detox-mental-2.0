import { createContext, useState } from 'react';
import { sessionsData } from '../data';

export const SessionsContext = createContext(null);

const SessionsProvider = ({ children }) => {
    const [sessions, setSessions] = useState(sessionsData);
    return (
        <SessionsContext.Provider value={{ sessions, setSessions }}>{children}</SessionsContext.Provider>
    )
}

export default SessionsProvider;