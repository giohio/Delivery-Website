import React, { createContext, useContext, useState, useEffect } from 'react';

interface Member {
  id?: string;
  email?: string;
  name?: string;
}

interface MemberContextType {
  member: Member | null;
  setMember: (member: Member | null) => void;
  isLoading: boolean;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, validate token and fetch user data
      setMember({ id: '1', email: 'user@example.com', name: 'User' });
    }
    setIsLoading(false);
  }, []);

  return (
    <MemberContext.Provider value={{ member, setMember, isLoading }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
}
