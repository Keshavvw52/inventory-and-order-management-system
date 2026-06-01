import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid var(--surface-border)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 500,
              fontSize: "0.875rem",
              fontFamily: "var(--font-sans)",
              boxShadow: "var(--shadow-md)"
            },
            success: {
              iconTheme: {
                primary: "var(--success)",
                secondary: "#ffffff"
              }
            },
            error: {
              iconTheme: {
                primary: "var(--danger)",
                secondary: "#ffffff"
              }
            }
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
