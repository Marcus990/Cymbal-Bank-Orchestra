// Proactive Insights functionality temporarily disabled
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { insightsService, Insight } from '../lib/insightsService';
// import { usePermissions } from './PermissionsContext';

// interface InsightsContextType {
//   insights: Insight[];
//   loading: boolean;
//   error: string | null;
//   refreshInsights: () => Promise<void>;
// }

// const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

// export const useInsights = () => {
//   const context = useContext(InsightsContext);
//   if (context === undefined) {
//     throw new Error('useInsights must be used within an InsightsProvider');
//   }
//   return context;
// };

// interface InsightsProviderProps {
//   children: ReactNode;
// }

// export const InsightsProvider: React.FC<InsightsProviderProps> = ({ children }) => {
//   const [insights, setInsights] = useState<Insight[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { hasCompletedOnboarding, userName } = usePermissions();

//   const fetchInsights = async () => {
//     if (!hasCompletedOnboarding || !userName) return;
//     
//     setLoading(true);
//     setError(null);
//     
//     try {
//       // Call the proactive insights agent to generate real insights
//       const response = await insightsService.getProactiveInsights(userName);
//       if (response.success) {
//         setInsights(response.insights);
//       } else {
//         setError(response.message || 'Failed to fetch insights');
//         
//         // Fallback to sample insights if the agent fails
//         const fallbackInsights: Insight[] = [
//           {
//             id: 'fallback-1',
//             message: 'Loading real insights...',
//             type: 'neutral',
//             icon: '⏳'
//           }
//         ];
//         setInsights(fallbackInsights);
//       }
//     } catch (err) {
//         console.error('Error fetching insights:', err);
//         setError('Failed to fetch insights. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//   const refreshInsights = async () => {
//     await fetchInsights();
//   };

//   useEffect(() => {
//     if (hasCompletedOnboarding && userName) {
//       fetchInsights();
//     }
//   }, [hasCompletedOnboarding, userName]);

//   // No cleanup needed for REST API calls

//   const value: InsightsContextType = {
//     insights,
//     loading,
//     error,
//     refreshInsights
//   };

//   return (
//     <InsightsContext.Provider value={value}>
//       {children}
//     </InsightsContext.Provider>
//   );
// };
